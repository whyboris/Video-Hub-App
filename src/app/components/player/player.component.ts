import type { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Component, NgZone, effect, viewChild } from '@angular/core';

import { FilePathService } from '../views/file-path.service';
import { ImageElementService } from '../../services/image-element.service';
import { PlayerService } from '../../services/player.service';

import type { PlayerItem } from '../../services/player.service';

import { fileUrl } from './file-url';
import { formatDuration } from '../playlists/playlist-utils';

const LOAD_TIMEOUT_MS = 8000;        // no `canplay` by then => treat the file as unplayable
const SKIP_COUNTDOWN_S = 5;          // unplayable item in a queue => skip after this many seconds
const HIDE_CONTROLS_MS = 2500;       // hide controls & cursor after this long without mouse movement
const PRELOAD_DELAY_MS = 1500;       // start preloading the next item this long after playback starts
const SPEEDS: number[] = [0.5, 0.75, 1, 1.25, 1.5, 2];
const STORAGE_KEY = 'vha-player';

type Slot = 0 | 1;

/**
 * Full-window built-in player
 * Two <video> elements take turns: one plays while the other preloads the next item,
 * so moving from clip to clip in a compilation is close to seamless
 */
@Component({
  standalone: false,
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, OnDestroy {

  readonly root = viewChild<ElementRef<HTMLElement>>('root');
  readonly videoA = viewChild<ElementRef<HTMLVideoElement>>('videoA');
  readonly videoB = viewChild<ElementRef<HTMLVideoElement>>('videoB');

  active: Slot = 0;
  private slotKey: string[] = [null, null];          // which item each slot holds
  private slotSrc: string[] = ['', ''];              // what was assigned to `src`
  private slotPendingSeek: number[] = [null, null];  // seek here once metadata is in
  private slotReady: boolean[] = [false, false];     // `canplay` fired for the current src

  playing = false;
  currentTime = 0;                  // of the active video
  duration = 0;

  muted = false;
  volume = 1;
  speed = 1;

  showQueue = false;
  controlsHidden = false;
  isFullscreen = false;
  finished = false;                 // reached the end of the queue

  errorItem: PlayerItem = null;     // current item could not be played
  skipCountdown = 0;

  scrubbing = false;

  topOffset = 0;                    // the app's title bar (window buttons) stays visible above the player

  formatDuration = formatDuration;

  private wantsPlay = true;          // false after the user pauses -- `canplay` must not resume

  private loadTimer: any = null;
  private skipTimer: any = null;
  private hideTimer: any = null;
  private preloadTimer: any = null;
  private frameCallbackToken = 0;
  private countedPlayFor: string = null;
  private shownKey: string = null;  // item currently shown -- reacts when the service moves on
  private shownVersion = -1;

  private keyListener = (event: KeyboardEvent) => this.onKey(event);
  private fullscreenListener = () => this.zone.run(() => this.isFullscreen = !!document.fullscreenElement);

  constructor(
    public filePathService: FilePathService,
    public imageElementService: ImageElementService,
    public player: PlayerService,
    private zone: NgZone,
  ) {
    // follow the service: Next / Previous / queue clicks / repeat
    effect(() => {
      const version: number = this.player.version();
      if (version !== this.shownVersion) {
        this.shownVersion = version;
        setTimeout(() => this.syncWithService(), 0);
      }
    });
  }

  ngOnInit(): void {
    const titleBar: Element = document.querySelector('.title-bar');
    this.topOffset = titleBar ? Math.max(0, Math.round(titleBar.getBoundingClientRect().bottom)) : 0;
    this.restorePreferences();
    window.addEventListener('keydown', this.keyListener, true); // capture: before the app's own shortcuts
    document.addEventListener('fullscreenchange', this.fullscreenListener);
    this.poke();
  }

  ngOnDestroy(): void {
    window.removeEventListener('keydown', this.keyListener, true);
    document.removeEventListener('fullscreenchange', this.fullscreenListener);
    clearTimeout(this.loadTimer);
    clearTimeout(this.preloadTimer);
    clearTimeout(this.hideTimer);
    clearInterval(this.skipTimer);
    [0, 1].forEach((slot: Slot) => {
      const video: HTMLVideoElement = this.video(slot);
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load(); // releases the file handle
      }
    });
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }

  // ===========================================================================================
  // What is playing
  // -------------------------------------------------------------------------------------------

  get item(): PlayerItem {
    return this.player.current();
  }

  get isHighlight(): boolean {
    const item: PlayerItem = this.item;
    return !!item && item.start !== undefined && item.end !== undefined;
  }

  /**
   * Position within the item -- for highlights the clip, not the whole video
   */
  get itemTime(): number {
    return this.isHighlight ? Math.max(0, this.currentTime - this.item.start) : this.currentTime;
  }

  get itemDuration(): number {
    return this.isHighlight ? this.item.end - this.item.start : this.duration;
  }

  get progressPercent(): number {
    return this.itemDuration > 0 ? Math.min(100, 100 * this.itemTime / this.itemDuration) : 0;
  }

  title(item: PlayerItem): string {
    return item.label || item.element.cleanName;
  }

  timing(item: PlayerItem): string {
    return item.start !== undefined && item.end !== undefined
      ? formatDuration(item.start) + ' – ' + formatDuration(item.end)
      : formatDuration(item.element.duration);
  }

  /**
   * Called whenever the service changes -- shows the new current item if it changed
   */
  private syncWithService(): void {
    if (!this.player.isOpen()) {
      return;
    }
    const item: PlayerItem = this.item;
    if (!item) {
      return;
    }
    // `repeat one` replays the same key -- `shownKey` is reset by `itemFinished` for that
    if (item.key !== this.shownKey) {
      this.show(item);
    }
  }

  /**
   * Put an item on screen: use the preloaded slot if it holds this item, otherwise load it
   */
  private show(item: PlayerItem): void {
    this.shownKey = item.key;
    this.finished = false;
    this.wantsPlay = true;
    this.clearError();
    clearTimeout(this.preloadTimer);

    const standby: Slot = this.other(this.active);
    const startAt: number = item.start !== undefined ? item.start : (this.player.startAt || 0);

    let slot: Slot;
    if (this.slotKey[standby] === item.key && this.slotSrc[standby] === this.srcFor(item)) {
      slot = standby; // preloaded
      const video: HTMLVideoElement = this.video(slot);
      if (this.slotPendingSeek[slot] === null && Math.abs(video.currentTime - startAt) > 0.3) {
        video.currentTime = startAt;
      }
    } else {
      slot = this.active;
      this.load(slot, item, startAt);
    }

    this.video(this.other(slot)).pause();
    this.active = slot;

    const video: HTMLVideoElement = this.video(slot);
    video.muted = this.muted;
    video.volume = this.volume;
    video.playbackRate = this.speed;
    this.currentTime = video.currentTime;
    this.duration = video.duration || item.element.duration;

    this.startLoadTimer(slot);
    this.tryPlay(slot);
    this.watchHighlightEnd(slot, item);
    this.poke();
  }

  private load(slot: Slot, item: PlayerItem, startAt: number): void {
    const video: HTMLVideoElement = this.video(slot);
    const src: string = this.srcFor(item);

    this.slotKey[slot] = item.key;
    this.slotPendingSeek[slot] = startAt;

    if (this.slotSrc[slot] !== src) {
      this.slotSrc[slot] = src;
      this.slotReady[slot] = false;
      video.src = src;
      video.load();
    } else if (video.readyState >= 1) {
      video.currentTime = startAt; // same file already loaded -- just seek
      this.slotPendingSeek[slot] = null;
    }
  }

  private srcFor(item: PlayerItem): string {
    return fileUrl(this.filePathService.getPathFromImageElement(item.element));
  }

  /**
   * Preload whatever plays next into the idle slot
   */
  private schedulePreload(): void {
    clearTimeout(this.preloadTimer);
    this.preloadTimer = setTimeout(() => {
      const next: PlayerItem = this.player.peekNext();
      if (!next || !this.player.isOpen()) {
        return;
      }
      const standby: Slot = this.other(this.active);
      const startAt: number = next.start !== undefined ? next.start : 0;
      this.load(standby, next, startAt);
      this.video(standby).pause();
    }, PRELOAD_DELAY_MS);
  }

  private tryPlay(slot: Slot): void {
    const video: HTMLVideoElement = this.video(slot);
    const promise: Promise<void> = video.play();
    if (promise) {
      promise.catch(() => {}); // a pending load interrupts play(); `canplay` retries
    }
  }

  // ===========================================================================================
  // <video> events -- bound in the template for both slots
  // -------------------------------------------------------------------------------------------

  onLoadedMetadata(slot: Slot): void {
    const video: HTMLVideoElement = this.video(slot);
    if (this.slotPendingSeek[slot] !== null) {
      video.currentTime = Math.min(this.slotPendingSeek[slot], Math.max(0, video.duration - 0.1));
      this.slotPendingSeek[slot] = null;
    }
    if (slot === this.active) {
      this.duration = video.duration;
    }
  }

  onCanPlay(slot: Slot): void {
    this.slotReady[slot] = true;
    if (slot === this.active) {
      clearTimeout(this.loadTimer);
      if (!this.finished && !this.errorItem && this.video(slot).paused && this.wantsPlay) {
        this.tryPlay(slot);
      }
    }
  }

  onPlaying(slot: Slot): void {
    if (slot !== this.active) {
      return;
    }
    this.playing = true;
    clearTimeout(this.loadTimer);
    this.countPlay(this.item); // only once it really plays -- an unplayable file is not a play
    this.schedulePreload();
    this.poke();
  }

  onPause(slot: Slot): void {
    if (slot === this.active) {
      this.playing = false;
      this.poke();
    }
  }

  onTimeUpdate(slot: Slot): void {
    if (slot !== this.active) {
      return;
    }
    const video: HTMLVideoElement = this.video(slot);
    if (!this.scrubbing) {
      this.currentTime = video.currentTime;
    }
    // fallback for the frame callback (e.g. when the window is hidden)
    if (this.isHighlight && video.currentTime >= this.item.end) {
      this.itemFinished();
    }
  }

  onEnded(slot: Slot): void {
    if (slot === this.active) {
      this.itemFinished();
    }
  }

  onError(slot: Slot): void {
    if (slot === this.active && this.slotSrc[slot]) {
      this.showError();
    } else {
      // preloading failed -- forget it, `show()` will load it again and report the error then
      this.slotKey[slot] = null;
      this.slotSrc[slot] = '';
    }
  }

  /**
   * Highlights end at `end` -- check every frame rather than on `timeupdate` (only ~4 times a second)
   */
  private watchHighlightEnd(slot: Slot, item: PlayerItem): void {
    const token: number = ++this.frameCallbackToken;
    if (item.end === undefined) {
      return;
    }
    const video: any = this.video(slot);
    if (!video.requestVideoFrameCallback) {
      return; // `timeupdate` fallback handles it
    }
    const check = (_now: number, meta: any) => {
      if (token !== this.frameCallbackToken) {
        return; // a newer item took over
      }
      if (meta.mediaTime >= item.end) {
        this.zone.run(() => this.itemFinished());
      } else {
        video.requestVideoFrameCallback(check);
      }
    };
    video.requestVideoFrameCallback(check);
  }

  private itemFinished(): void {
    if (this.finished || this.errorItem) {
      return;
    }
    this.frameCallbackToken++; // stop the frame watcher
    const wasKey: string = this.shownKey;
    if (this.player.advance()) {
      if (this.item && this.item.key === wasKey) {
        this.shownKey = null; // `repeat one` -- show the same item again
        this.syncWithService();
      }
    } else {
      this.video(this.active).pause();
      this.finished = true;
      this.controlsHidden = false;
    }
  }

  private countPlay(item: PlayerItem): void {
    // whole videos count as a play, like opening them externally; highlights don't
    // once per visit to a queue position -- resuming after pause or `repeat one` doesn't count again
    if (item && item.start === undefined && this.countedPlayFor !== item.key + ':' + this.player.position) {
      this.countedPlayFor = item.key + ':' + this.player.position;
      this.imageElementService.updateNumberOfTimesPlayed(item.element.index);
    }
  }

  // ===========================================================================================
  // Unplayable files
  // -------------------------------------------------------------------------------------------

  private startLoadTimer(slot: Slot): void {
    clearTimeout(this.loadTimer);
    if (this.slotReady[slot]) {
      return;
    }
    this.loadTimer = setTimeout(() => {
      if (slot === this.active && !this.slotReady[slot]) {
        this.zone.run(() => this.showError());
      }
    }, LOAD_TIMEOUT_MS);
  }

  private showError(): void {
    clearTimeout(this.loadTimer);
    this.frameCallbackToken++;
    this.video(this.active).pause();
    this.errorItem = this.item;
    this.controlsHidden = false;

    if (this.player.hasNext) {
      this.skipCountdown = SKIP_COUNTDOWN_S;
      clearInterval(this.skipTimer);
      this.skipTimer = setInterval(() => this.zone.run(() => {
        this.skipCountdown--;
        if (this.skipCountdown <= 0) {
          this.skip();
        }
      }), 1000);
    }
  }

  private clearError(): void {
    clearInterval(this.skipTimer);
    this.errorItem = null;
    this.skipCountdown = 0;
  }

  skip(): void {
    this.clearError();
    // the broken file must not be reused from the slot
    this.slotKey[this.active] = null;
    this.slotSrc[this.active] = '';
    if (!this.player.next()) {
      this.finished = true;
    }
  }

  stopCountdown(): void {
    clearInterval(this.skipTimer);
    this.skipCountdown = 0;
  }

  openExternally(): void {
    const item: PlayerItem = this.item;
    if (!item) {
      return;
    }
    const seconds: number = this.errorItem ? (item.start || 0) : this.video(this.active).currentTime;
    this.video(this.active).pause();
    this.stopCountdown();
    this.player.openExternally(item.element, seconds);
  }

  // ===========================================================================================
  // Controls
  // -------------------------------------------------------------------------------------------

  togglePlay(): void {
    if (this.finished) {
      this.replay();
      return;
    }
    const video: HTMLVideoElement = this.video(this.active);
    if (video.paused) {
      this.wantsPlay = true;
      this.tryPlay(this.active);
    } else {
      this.wantsPlay = false;
      video.pause();
    }
  }

  next(): void {
    this.player.next();
  }

  previous(): void {
    // like most players: restart the item unless near its beginning
    if (this.itemTime > 3 || !this.player.hasPrevious) {
      this.seekWithinItem(0);
    } else {
      this.player.previous();
    }
  }

  replay(): void {
    this.finished = false;
    this.shownKey = null;
    this.player.restart();
    this.syncWithService();
  }

  jumpTo(itemIndex: number): void {
    this.player.jumpTo(itemIndex);
  }

  close(): void {
    this.player.close();
  }

  /**
   * Seek relative to the item start; for highlights stays inside the clip
   */
  seekWithinItem(seconds: number): void {
    const video: HTMLVideoElement = this.video(this.active);
    const clamped: number = Math.max(0, Math.min(seconds, Math.max(0, this.itemDuration - 0.05)));
    video.currentTime = (this.isHighlight ? this.item.start : 0) + clamped;
    this.currentTime = video.currentTime;
    if (this.finished) {
      this.finished = false;
    }
    if (this.isHighlight) {
      this.watchHighlightEnd(this.active, this.item);
    }
  }

  seekBy(seconds: number): void {
    this.seekWithinItem(this.itemTime + seconds);
  }

  stepFrame(direction: 1 | -1): void {
    const video: HTMLVideoElement = this.video(this.active);
    video.pause();
    this.wantsPlay = false;
    const fps: number = this.item.element.fps || 30;
    this.seekBy(direction / fps);
  }

  toggleMute(): void {
    this.muted = !this.muted;
    this.video(this.active).muted = this.muted;
    this.savePreferences();
  }

  setVolume(event: Event): void {
    this.volume = Number((event.target as HTMLInputElement).value);
    this.muted = this.volume === 0;
    const video: HTMLVideoElement = this.video(this.active);
    video.volume = this.volume;
    video.muted = this.muted;
    this.savePreferences();
  }

  changeSpeed(direction: 1 | -1): void {
    const index: number = SPEEDS.indexOf(this.speed);
    const nextIndex: number = Math.max(0, Math.min(SPEEDS.length - 1, (index === -1 ? 2 : index) + direction));
    this.speed = SPEEDS[nextIndex];
    this.video(this.active).playbackRate = this.speed;
    this.video(this.other(this.active)).playbackRate = this.speed;
    this.savePreferences();
  }

  cycleSpeed(): void {
    const index: number = SPEEDS.indexOf(this.speed);
    this.speed = SPEEDS[(index + 1) % SPEEDS.length];
    this.video(this.active).playbackRate = this.speed;
    this.savePreferences();
  }

  toggleFullscreen(): void {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      this.root()?.nativeElement.requestFullscreen().catch(() => {});
    }
  }

  // ------------------------------------------------------------- scrubber

  scrubStart(event: PointerEvent): void {
    const bar: HTMLElement = event.currentTarget as HTMLElement;
    bar.setPointerCapture(event.pointerId);
    this.scrubbing = true;
    this.scrubTo(event);
  }

  scrubMove(event: PointerEvent): void {
    if (this.scrubbing) {
      this.scrubTo(event);
    }
  }

  scrubEnd(event: PointerEvent): void {
    if (this.scrubbing) {
      this.scrubTo(event);
      this.scrubbing = false;
    }
  }

  private scrubTo(event: PointerEvent): void {
    const rect: DOMRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const fraction: number = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    this.seekWithinItem(fraction * this.itemDuration);
  }

  // ------------------------------------------------------------- controls auto-hide

  poke(): void {
    this.controlsHidden = false;
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => {
      if (this.playing && !this.showQueue && !this.errorItem && !this.finished && !this.scrubbing) {
        this.controlsHidden = true;
      }
    }, HIDE_CONTROLS_MS);
  }

  // ------------------------------------------------------------- keyboard

  private onKey(event: KeyboardEvent): void {
    if (!this.player.isOpen()) {
      return;
    }
    const target = event.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'text')) {
      return; // typing (phase 3: highlight labels)
    }

    // the player owns the keyboard while open -- nothing reaches the app underneath
    event.stopPropagation();

    this.zone.run(() => {
      let handled = true;
      switch (event.key) {
        case ' ':
        case 'k':
        case 'K':          this.togglePlay(); break;
        case 'ArrowLeft':  event.shiftKey ? this.stepFrame(-1) : this.seekBy(-5); break;
        case 'ArrowRight': event.shiftKey ? this.stepFrame(1)  : this.seekBy(5);  break;
        case 'n':
        case 'N':          this.next(); break;
        case 'p':
        case 'P':          this.previous(); break;
        case 'f':
        case 'F':          this.toggleFullscreen(); break;
        case 'm':
        case 'M':          this.toggleMute(); break;
        case 's':
        case 'S':          this.player.toggleShuffle(); break;
        case 'r':
        case 'R':          this.player.cycleRepeat(); break;
        case '<':
        case ',':          this.changeSpeed(-1); break;
        case '>':
        case '.':          this.changeSpeed(1); break;
        case 'q':
        case 'Q':          this.showQueue = !this.showQueue; break;
        case 'Escape':
          if (document.fullscreenElement) {
            this.toggleFullscreen();
          } else {
            this.close();
          }
          break;
        default:           handled = false;
      }
      if (handled) {
        event.preventDefault();
        this.poke();
      }
    });
  }

  // ===========================================================================================
  // Helpers
  // -------------------------------------------------------------------------------------------

  video(slot: Slot): HTMLVideoElement {
    const ref: ElementRef<HTMLVideoElement> = slot === 0 ? this.videoA() : this.videoB();
    return ref ? ref.nativeElement : undefined;
  }

  private other(slot: Slot): Slot {
    return slot === 0 ? 1 : 0;
  }

  private restorePreferences(): void {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      this.muted = !!saved.muted;
      this.volume = typeof saved.volume === 'number' ? saved.volume : 1;
      this.speed = SPEEDS.includes(saved.speed) ? saved.speed : 1;
    } catch {}
  }

  private savePreferences(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ muted: this.muted, volume: this.volume, speed: this.speed }));
    } catch {}
  }

}
