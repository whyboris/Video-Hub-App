import type { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Component, NgZone, effect, viewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { FilePathService } from '../views/file-path.service';
import { ImageElementService } from '../../services/image-element.service';
import { MediaService } from '../../services/media.service';
import { ModalService } from '../modal/modal.service';
import { PlayerService } from '../../services/player.service';
import { PlaylistService } from '../../services/playlist.service';

import type { ContextMenuCoordinate } from '../../../../interfaces/shared-interfaces';
import type { MediaPlan } from '../../../../interfaces/media-plan.interface';
import type { PlayerItem } from '../../services/player.service';
import type { StarRating } from '../../../../interfaces/final-object.interface';

import { fileUrl } from './file-url';
import { formatDuration } from '../playlists/playlist-utils';

const LOAD_TIMEOUT_MS = 15000;       // no `canplay` by then => treat the file as unplayable
const SKIP_COUNTDOWN_S = 5;          // unplayable item in a queue => skip after this many seconds
const HIDE_CONTROLS_MS = 2500;       // hide controls & cursor after this long without mouse movement
const PRELOAD_DELAY_MS = 1500;       // start preloading the next item this long after playback starts
const STREAM_SEEK_DELAY_MS = 250;    // converted streams restart on seek -- wait for key repeats to settle
const SPEEDS: number[] = [0.5, 0.75, 1, 1.25, 1.5, 2];
const STORAGE_KEY = 'vha-player';

type Slot = 0 | 1;

/**
 * What one <video> element holds
 *  - `direct`: the file itself; seeking is instant
 *  - `stream`: converted by ffmpeg while it plays, starting at `offset` in the file;
 *              the element's time 0 is `offset`, and seeking restarts the conversion
 */
interface SlotState {
  item: PlayerItem;
  startAt: number;         // where this item was asked to start
  path: string;
  src: string;
  mode: 'direct' | 'stream';
  offset: number;
  copyAudio: boolean;
  pendingSeek: number;     // direct: seek here once metadata is in
  ready: boolean;          // `canplay` fired for the current src
  token: number;           // bumps on every load -- answers for an older load are dropped
}

function emptySlot(): SlotState {
  return { item: null, startAt: 0, path: '', src: '', mode: 'direct', offset: 0, copyAudio: false, pendingSeek: null, ready: false, token: 0 };
}

/**
 * Full-window built-in player
 * Two <video> elements take turns: one plays while the other preloads the next item,
 * so moving from clip to clip in a compilation is close to seamless.
 * Files Chromium can't decode (old camera AVIs, MPG, AC3/DTS soundtracks…) are converted on the fly.
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
  private slots: SlotState[] = [emptySlot(), emptySlot()];

  playing = false;
  currentTime = 0;                  // position in the file of the active item
  duration = 0;

  muted = false;
  volume = 1;
  speed = 1;

  showQueue = false;
  controlsHidden = false;
  isFullscreen = false;
  finished = false;                 // reached the end of the queue
  converting = false;               // the active item is being converted while it plays

  errorItem: PlayerItem = null;     // current item could not be played
  skipCountdown = 0;

  scrubbing = false;

  pickerShowing = false;            // `Add to playlist` popover
  pickerPosition: ContextMenuCoordinate = { x: 0, y: 0 };

  topOffset = 0;                    // the app's title bar (window buttons) stays visible above the player

  stars: number[] = [1, 2, 3, 4, 5];

  formatDuration = formatDuration;

  private wantsPlay = true;         // false after the user pauses -- `canplay` must not resume
  private loadTimer: any = null;
  private skipTimer: any = null;
  private hideTimer: any = null;
  private preloadTimer: any = null;
  private streamSeekTimer: any = null;
  private frameCallbackToken = 0;
  private showToken = 0;
  private countedPlayFor: string = null;
  private shownKey: string = null;  // item currently shown -- reacts when the service moves on
  private shownVersion = -1;

  private keyListener = (event: KeyboardEvent) => this.onKey(event);
  private fullscreenListener = () => this.zone.run(() => this.isFullscreen = !!document.fullscreenElement);

  constructor(
    public filePathService: FilePathService,
    public imageElementService: ImageElementService,
    public mediaService: MediaService,
    public modalService: ModalService,
    public player: PlayerService,
    public playlistService: PlaylistService,
    public translate: TranslateService,
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
    clearTimeout(this.streamSeekTimer);
    clearInterval(this.skipTimer);
    [0, 1].forEach((slot: Slot) => {
      const video: HTMLVideoElement = this.video(slot);
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load(); // releases the file handle
      }
    });
    this.mediaService.stopAll();
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
   * Position in the file of what a slot shows now
   */
  private mediaTime(slot: Slot): number {
    return this.video(slot).currentTime + this.slots[slot].offset;
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
  private async show(item: PlayerItem): Promise<void> {
    const showToken: number = ++this.showToken;
    this.shownKey = item.key;
    this.finished = false;
    this.wantsPlay = true;
    this.pickerShowing = false;
    this.clearError();
    clearTimeout(this.preloadTimer);
    clearTimeout(this.streamSeekTimer);
    this.streamSeekTimer = null;
    this.frameCallbackToken++;

    const startAt: number = item.start !== undefined ? item.start : (this.player.startAt || 0);
    const standby: Slot = this.other(this.active);
    const preloaded: boolean = this.slots[standby].item === item && this.slots[standby].startAt === startAt && !!this.slots[standby].src;

    const slot: Slot = preloaded ? standby : this.active;
    this.video(this.other(slot)).pause();
    this.active = slot;
    this.currentTime = startAt;
    this.duration = item.element.duration;
    this.playing = false;

    if (preloaded) {
      const s: SlotState = this.slots[slot];
      if (s.mode === 'direct' && s.pendingSeek === null && Math.abs(this.mediaTime(slot) - startAt) > 0.3) {
        this.video(slot).currentTime = startAt;
      }
    } else {
      await this.load(slot, item, startAt);
      if (showToken !== this.showToken) {
        return; // the user moved on meanwhile
      }
    }

    const video: HTMLVideoElement = this.video(slot);
    video.muted = this.muted;
    video.volume = this.volume;
    video.playbackRate = this.speed;
    this.converting = this.slots[slot].mode === 'stream';

    this.startLoadTimer(slot);
    this.tryPlay(slot);
    this.watchHighlightEnd(slot, item);
    this.poke();
  }

  /**
   * Load an item into a slot -- directly if Chromium can play it, otherwise as a converted stream
   */
  private async load(slot: Slot, item: PlayerItem, startAt: number): Promise<void> {
    const s: SlotState = this.slots[slot];
    const token: number = ++s.token;
    const path: string = this.filePathService.getPathFromImageElement(item.element);

    s.item = item;
    s.startAt = startAt;

    const plan: MediaPlan = await this.mediaService.plan(path);
    if (token !== s.token) {
      return;
    }

    s.path = path;
    s.copyAudio = plan.copyAudio;

    if (plan.mode === 'direct') {
      this.loadDirect(slot, path, startAt);
    } else {
      this.loadStream(slot, startAt);
    }
  }

  private loadDirect(slot: Slot, path: string, startAt: number): void {
    const s: SlotState = this.slots[slot];
    const video: HTMLVideoElement = this.video(slot);
    const src: string = fileUrl(path);

    if (s.mode === 'stream') {
      this.mediaService.stop(this.streamId(slot));
    }
    s.mode = 'direct';
    s.offset = 0;

    if (s.src !== src) {
      s.src = src;
      s.ready = false;
      s.pendingSeek = startAt;
      video.src = src;
      video.load();
    } else if (video.readyState >= 1) {
      video.currentTime = startAt; // same file already loaded -- just seek
      s.pendingSeek = null;
    } else {
      s.pendingSeek = startAt;
    }
  }

  /**
   * Convert from `startAt` -- for highlights only up to the clip end
   */
  private loadStream(slot: Slot, startAt: number): void {
    const s: SlotState = this.slots[slot];
    const video: HTMLVideoElement = this.video(slot);
    const item: PlayerItem = s.item;
    const length: number = item.end !== undefined ? Math.max(0.5, item.end - startAt + 0.5) : 0;

    s.mode = 'stream';
    s.offset = startAt;
    s.pendingSeek = null;
    s.ready = false;
    s.src = this.mediaService.streamUrl(s.path, startAt, length, s.copyAudio, this.streamId(slot));
    video.src = s.src;
    video.load();
  }

  private streamId(slot: Slot): string {
    return 'player-slot-' + slot;
  }

  /**
   * Preload whatever plays next into the idle slot
   */
  private schedulePreload(): void {
    clearTimeout(this.preloadTimer);
    this.preloadTimer = setTimeout(async () => {
      const next: PlayerItem = this.player.peekNext();
      if (!next || !this.player.isOpen() || next === this.item) {
        return;
      }
      const standby: Slot = this.other(this.active);
      await this.load(standby, next, next.start !== undefined ? next.start : 0);
      if (standby !== this.active) {
        this.video(standby).pause();
      }
    }, PRELOAD_DELAY_MS);
  }

  private tryPlay(slot: Slot): void {
    const promise: Promise<void> = this.video(slot).play();
    if (promise) {
      promise.catch(() => {}); // a pending load interrupts play(); `canplay` retries
    }
  }

  // ===========================================================================================
  // <video> events -- bound in the template for both slots
  // -------------------------------------------------------------------------------------------

  onLoadedMetadata(slot: Slot): void {
    const s: SlotState = this.slots[slot];
    const video: HTMLVideoElement = this.video(slot);

    // plays sound but no picture (e.g. MPEG-4 Part 2 inside .mp4) -- convert instead
    if (s.mode === 'direct' && video.videoWidth === 0 && s.item && s.item.element.width > 0) {
      this.fallBackToStream(slot);
      return;
    }

    if (s.pendingSeek !== null) {
      video.currentTime = Math.min(s.pendingSeek, Math.max(0, video.duration - 0.1));
      s.pendingSeek = null;
    }
    if (slot === this.active && s.mode === 'direct' && isFinite(video.duration)) {
      this.duration = video.duration;
    }
  }

  onCanPlay(slot: Slot): void {
    this.slots[slot].ready = true;
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
    if (slot !== this.active || !this.slots[slot].src) {
      return;
    }
    const position: number = this.mediaTime(slot);
    if (!this.scrubbing && !this.streamSeekTimer) {
      this.currentTime = position;
    }
    // fallback for the frame callback (e.g. when the window is hidden)
    if (this.isHighlight && position >= this.item.end) {
      this.itemFinished();
    }
  }

  onEnded(slot: Slot): void {
    if (slot === this.active) {
      this.itemFinished();
    }
  }

  onError(slot: Slot): void {
    const s: SlotState = this.slots[slot];
    if (!s.src) {
      return; // src was cleared on purpose
    }
    if (s.mode === 'direct') {
      this.fallBackToStream(slot);
    } else if (slot === this.active) {
      this.showError();
    } else {
      // preloading failed -- forget it, `show()` will load it again and report the error then
      this.slots[slot] = { ...emptySlot(), token: s.token + 1 };
    }
  }

  /**
   * Direct playback failed -- convert this file instead, from where it should have started
   */
  private fallBackToStream(slot: Slot): void {
    const s: SlotState = this.slots[slot];
    this.mediaService.markStreamOnly(s.path);
    s.token++;
    this.loadStream(slot, s.startAt);
    if (slot === this.active) {
      this.converting = true;
      this.startLoadTimer(slot);
      if (this.wantsPlay) {
        this.tryPlay(slot);
      }
      this.watchHighlightEnd(slot, s.item);
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
      if (meta.mediaTime + this.slots[slot].offset >= item.end) {
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
    if (this.slots[slot].ready) {
      return;
    }
    this.loadTimer = setTimeout(() => {
      if (slot === this.active && !this.slots[slot].ready) {
        this.zone.run(() => this.slots[slot].mode === 'direct' ? this.fallBackToStream(slot) : this.showError());
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
    this.slots[this.active] = { ...emptySlot(), token: this.slots[this.active].token + 1 };
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
    const seconds: number = this.errorItem ? (item.start || 0) : this.currentTime;
    this.video(this.active).pause();
    this.stopCountdown();
    this.player.openExternally(item.element, seconds);
  }

  // ===========================================================================================
  // Rating, favorite, playlists
  // -------------------------------------------------------------------------------------------

  /**
   * Stars as the app stores them: 0.5 = none, 1.5 = 1 star … 5.5 = 5 stars (also "favorite")
   */
  starsOf(item: PlayerItem): number {
    return item ? Math.round(item.element.stars - 0.5) : 0;
  }

  setStars(stars: number): void {
    const item: PlayerItem = this.item;
    if (!item) {
      return;
    }
    const value = (this.starsOf(item) === stars ? 0.5 : stars + 0.5) as StarRating; // same star again clears
    this.imageElementService.HandleEmission({ index: item.element.index, stars: value });
    this.poke();
  }

  clearStars(): void {
    const item: PlayerItem = this.item;
    if (item && this.starsOf(item)) {
      this.imageElementService.HandleEmission({ index: item.element.index, stars: 0.5 });
    }
  }

  toggleFavorite(): void {
    const item: PlayerItem = this.item;
    if (item) {
      this.imageElementService.toggleHeart(item.element.index);
      this.poke();
    }
  }

  openPicker(event?: MouseEvent): void {
    const button: HTMLElement = event ? event.currentTarget as HTMLElement : null;
    const rect: DOMRect = button ? button.getBoundingClientRect() : new DOMRect(window.innerWidth - 260, this.topOffset + 60, 0, 0);
    this.pickerPosition = { x: rect.left, y: rect.bottom + 6 };
    this.pickerShowing = true;
    this.controlsHidden = false;
  }

  addToPlaylist(playlistId: string): void {
    this.pickerShowing = false;
    const item: PlayerItem = this.item;
    const playlist = this.playlistService.get(playlistId);
    if (!item || !playlist) {
      return;
    }
    // a highlight being played is added as that highlight, a whole video as the whole video
    const range = item.start !== undefined && item.end !== undefined
      ? { start: item.start, end: item.end, label: item.label }
      : undefined;
    const added: number = this.playlistService.addVideos(playlistId, [item.element], range);
    this.modalService.openSnackbar(
      this.translate.instant(added ? 'PLAYLISTS.addedToSnack' : 'PLAYLISTS.alreadyIn', { count: added, name: playlist.name }),
      1500
    );
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
    const s: SlotState = this.slots[this.active];
    const clamped: number = Math.max(0, Math.min(seconds, Math.max(0, this.itemDuration - 0.05)));
    const target: number = (this.isHighlight ? this.item.start : 0) + clamped;

    this.currentTime = target;
    if (this.finished) {
      this.finished = false;
    }

    if (s.mode === 'direct') {
      this.video(this.active).currentTime = target;
      if (this.isHighlight) {
        this.watchHighlightEnd(this.active, this.item);
      }
      return;
    }

    // converted stream -- restart the conversion there once the user stops moving
    clearTimeout(this.streamSeekTimer);
    this.streamSeekTimer = setTimeout(() => {
      this.streamSeekTimer = null;
      if (!this.scrubbing) {
        this.restartStreamAt(this.currentTime);
      }
    }, STREAM_SEEK_DELAY_MS);
  }

  private restartStreamAt(position: number): void {
    const slot: Slot = this.active;
    this.slots[slot].token++;
    this.loadStream(slot, position);
    this.startLoadTimer(slot);
    if (this.wantsPlay) {
      this.tryPlay(slot);
    }
    if (this.isHighlight) {
      this.watchHighlightEnd(slot, this.item);
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
      if (this.slots[this.active].mode === 'stream') {
        clearTimeout(this.streamSeekTimer);
        this.streamSeekTimer = null;
        this.restartStreamAt(this.currentTime);
      }
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
      if (this.playing && !this.showQueue && !this.errorItem && !this.finished && !this.scrubbing && !this.pickerShowing) {
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
    if (target && target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'text') {
      return; // typing a name in the playlist picker
    }

    // the player owns the keyboard while open -- nothing reaches the app underneath
    event.stopPropagation();

    if (this.pickerShowing) {
      if (event.key === 'Escape') {
        this.zone.run(() => this.pickerShowing = false);
      }
      return;
    }

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
        case 'a':
        case 'A':          this.openPicker(); break;
        case 'h':
        case 'H':          this.toggleFavorite(); break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':          this.setStars(Number(event.key)); break;
        case '0':          this.clearStars(); break;
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
