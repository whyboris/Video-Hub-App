import type { AfterViewInit, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Component, NgZone, computed, effect, input, output, viewChild } from '@angular/core';

import { FilePathService } from '../file-path.service';
import { ImageElementService } from './../../../services/image-element.service';
import { VideoAutoplaySchedulerService } from './../../../services/video-autoplay-scheduler.service';

import type { ImageElement } from '../../../../../interfaces/final-object.interface';
import type { RightClickEmit, VideoClickEmit } from '../../../../../interfaces/shared-interfaces';

import { metaAppear, textAppear } from '../../../common/animations';

// margin to stop just short of a snippet's end so a `timeupdate` (fires ~4x/s)
// never bleeds into the next snippet of the concatenated clip
const LOOP_END_MARGIN = 0.25;
// skip the very first frames of a snippet (concat boundary can hold a stale frame)
const LOOP_START_OFFSET = 0.05;

@Component({
  standalone: false,
  selector: 'app-segments-item',
  templateUrl: './segments.component.html',
  styleUrls: [
      '../time-and-rez.scss',
      '../selected.scss',
      './segments.component.scss'
    ],
  animations: [ textAppear, metaAppear ]
})
export class SegmentsComponent implements OnInit, AfterViewInit, OnDestroy {

  readonly segmentsHolder = viewChild<ElementRef<HTMLElement>>('segmentsHolder');

  readonly rightClick = output<RightClickEmit>();
  readonly sheetClick = output<any>(); // does not emit data of any kind
  readonly videoClick = output<VideoClickEmit>();

  readonly video = input<ImageElement>();

  readonly autoplay = input<boolean>();
  readonly clipSnippets = input<number>();
  readonly compactView = input<boolean>();
  readonly darkMode = input<boolean>();
  readonly folderPath = input<string>();
  readonly forceMute = input<boolean>();
  readonly galleryWidth = input<number>();
  readonly hubName = input<string>();
  readonly largerFont = input<boolean>();
  readonly previewWidth = input<number>();
  readonly showFavorites = input<boolean>();
  readonly showMeta = input<boolean>();
  readonly snippetLength = input<number>();

  // 16:9 tiles: fill the gallery width with all snippets by default;
  // zooming in (fewer imgsPerRow -> larger previewWidth) enlarges tiles and the row scrolls horizontally
  readonly cellWidth = computed(() => {
    const n = Math.max(1, this.clipSnippets() || 1);
    const available = Math.max(0, (this.galleryWidth() || 0) - 40 - (n - 1) * 2); // margins + 2px gaps
    return Math.max(available / n, this.previewWidth() || 0);
  });
  readonly cellHeight = computed(() => this.cellWidth() * (9 / 16));
  readonly titleFontSize = computed(() => {
    const base = Math.round(Math.min(Math.max(this.cellWidth() * 0.075, 11), 22));
    return this.largerFont() ? Math.round(base * 1.33) : base;
  });

  readonly segmentIndexes = computed(() =>
    Array.from({ length: Math.max(0, this.clipSnippets() || 0) }, (_, i) => i));

  pathToClip = '';
  noError = true;

  // when false, [src] is unbound in the template -- releases the decoder for a
  // row that's still mounted (e.g. just outside the visible viewport, ahead of
  // virtual-scroller actually destroying it) but not actually on screen.
  isRowVisible = true;

  private cleanupFns: (() => void)[] = [];
  // cancel functions for scheduled-but-not-yet-started autoplay begins, keyed by
  // the <video> they belong to (hover-triggered playback bypasses the scheduler
  // entirely and is never tracked here)
  private pendingAutoplayStarts = new Map<HTMLVideoElement, () => void>();

  constructor(
    public filePathService: FilePathService,
    public imageElementService: ImageElementService,
    private ngZone: NgZone,
    private scheduler: VideoAutoplaySchedulerService,
  ) {
    // Mirrors clip.component's `@if(!autoplay()) / @if(autoplay())` template swap, which
    // naturally re-applies the current mode whenever the button is toggled. This component
    // keeps one persistent <video> per cell (cheaper: N cells/row vs. clip view's 1),
    // so the same "toggle takes effect immediately" behavior is done explicitly here instead
    // of relying on Angular destroying/recreating the elements.
    effect(() => {
      const wantAutoplay = this.autoplay();
      this.ngZone.runOutsideAngular(() => {
        this.eachVideo((v) => {
          const cell = this.asSegmentVideo(v);
          if (!cell || v.readyState < 1) { return; } // not loaded yet -- initCell() will apply the current mode once it is
          if (wantAutoplay) {
            v.muted = true;
            this.tryAutoplayStart(v);
          } else {
            v.pause();
            v.muted = true;
            v.currentTime = cell.start; // back to the parked poster-frame state
            this.cancelPendingAutoplayStart(v);
          }
        });
      });
    });
  }

  ngOnInit(): void {
    const hash = this.video().hash;
    if (!hash || hash.indexOf(':') !== -1) { // no clip, or a *FOLDER* (multi-hash) row
      this.noError = false;
      return;
    }
    this.pathToClip = this.filePathService.createFilePath(this.folderPath(), this.hubName(), 'clips', hash, true);
  }

  /**
   * All media event handling runs OUTSIDE Angular's zone via delegated listeners:
   * `timeupdate` fires ~4x/second per <video> — letting it trigger change detection
   * for every cell would burn CPU (a real concern on machines without hardware
   * video decode). Nothing here touches template state, so no CD is needed.
   */
  ngAfterViewInit(): void {
    const holder = this.segmentsHolder()?.nativeElement;
    if (!holder || !this.noError) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      const on = (type: string, handler: (e: Event) => void, capture: boolean) => {
        holder.addEventListener(type, handler, capture);
        this.cleanupFns.push(() => holder.removeEventListener(type, handler, capture));
      };

      // media events do not bubble -> listen in capture phase on the row container
      on('loadedmetadata', (event: Event) => {
        const cell = this.asSegmentVideo(event.target);
        if (cell) { this.initCell(cell); }
      }, true);

      // A cached clip file can fire `loadedmetadata` BEFORE this handler is attached
      // (e.g. when the view is re-entered), so seed any already-loaded videos now.
      holder.querySelectorAll('video').forEach((v: HTMLVideoElement) => {
        if (v.readyState >= 1) { // HAVE_METADATA
          const cell = this.asSegmentVideo(v);
          if (cell) { this.initCell(cell); }
        }
      });

      const loopBack = (event: Event) => {
        const cell = this.asSegmentVideo(event.target);
        if (!cell) { return; }
        const t = cell.video.currentTime;
        if (t >= cell.end || t < cell.start - LOOP_START_OFFSET || cell.video.ended) {
          cell.video.currentTime = cell.start;
          if (cell.video.ended) {
            this.tryPlay(cell.video);
          }
        }
      };
      on('timeupdate', loopBack, true);
      on('ended', loopBack, true);

      // hover always plays immediately, bypassing the idle scheduler entirely --
      // a deliberate user action must never wait on an autoplay video that's
      // still in its idle-scheduled holding period
      on('mouseover', (event: Event) => {
        const cell = this.asSegmentVideo(event.target);
        if (!cell) { return; }
        cell.video.muted = this.forceMute() || false; // real hover is a user gesture, so sound is allowed
        this.tryPlay(cell.video);
        if (this.autoplay()) {
          this.cancelPendingAutoplayStart(cell.video); // now playing directly; no need for the deferred start to also fire
        }
      }, false);

      on('mouseout', (event: Event) => {
        const cell = this.asSegmentVideo(event.target);
        if (!cell) { return; }
        cell.video.muted = true;
        if (!this.autoplay()) {
          cell.video.pause();
          cell.video.currentTime = cell.start; // reset to the segment's poster frame
        }
      }, false);

      // save the battery/fans when the app loses focus (autoplay mode)
      const onBlur = () => this.eachVideo((v) => {
        v.pause();
        this.cancelPendingAutoplayStart(v); // re-scheduled on focus via tryAutoplayStart
      });
      const onFocus = () => {
        if (this.autoplay()) {
          this.eachVideo((v) => this.tryAutoplayStart(v));
        }
      };
      window.addEventListener('blur', onBlur);
      window.addEventListener('focus', onFocus);
      this.cleanupFns.push(() => {
        window.removeEventListener('blur', onBlur);
        window.removeEventListener('focus', onFocus);
      });

      // virtual-scroller ([bufferAmount]="0") should destroy this row once it's
      // off screen, but this reacts faster and independently of any buffer/
      // overscan -- the moment it isn't actually intersecting the viewport,
      // release its decoders (same idea as ngOnDestroy), restoring the instant
      // it's visible again. root must be the actual scrolling element --
      // <virtual-scroller> scrolls internally (overflow-y: auto), not the page,
      // so the default root (browser viewport) would never see this as hidden.
      const scrollRoot = holder.closest('virtual-scroller');
      const intersectionObserver = new IntersectionObserver((entries) => {
        const isIntersecting = entries[entries.length - 1].isIntersecting;
        if (!isIntersecting) {
          this.eachVideo((v) => v.pause());
          this.pendingAutoplayStarts.forEach((cancel) => cancel());
          this.pendingAutoplayStarts.clear();
        }
        this.ngZone.run(() => { this.isRowVisible = isIntersecting; });
      }, { root: scrollRoot, threshold: 0 });
      intersectionObserver.observe(holder);
      this.cleanupFns.push(() => intersectionObserver.disconnect());
    });
  }

  ngOnDestroy(): void {
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns = [];
    this.pendingAutoplayStarts.forEach((cancel) => cancel());
    this.pendingAutoplayStarts.clear();
    // release decoder resources deterministically
    this.eachVideo((v) => {
      v.pause();
      v.removeAttribute('src');
      v.load();
    });
  }

  /**
   * Resolve an event target to its <video> cell + loop window inside the clip
   */
  private asSegmentVideo(target: EventTarget): { video: HTMLVideoElement, start: number, end: number } {
    if (!(target instanceof HTMLVideoElement) || target.dataset.seg === undefined) {
      return undefined;
    }
    const i = parseInt(target.dataset.seg, 10);
    const length = this.snippetLength() || 1;
    const start = i * length + LOOP_START_OFFSET;
    const end = Math.max(start + 0.1, (i + 1) * length - LOOP_END_MARGIN);
    return { video: target, start, end };
  }

  /**
   * Park a cell at its snippet start and, in autoplay mode, begin playing it.
   * Idempotent — safe to call from both `loadedmetadata` and the already-loaded sweep.
   */
  private initCell(cell: { video: HTMLVideoElement, start: number, end: number }): void {
    cell.video.muted = true; // set imperatively: [muted] binding is unreliable and blocks programmatic play()
    if (Math.abs(cell.video.currentTime - cell.start) > 0.01) {
      cell.video.currentTime = cell.start;
    }
    if (this.autoplay() && cell.video.paused) {
      this.tryAutoplayStart(cell.video);
    }
  }

  private eachVideo(fn: (v: HTMLVideoElement) => void): void {
    const holder = this.segmentsHolder()?.nativeElement;
    if (!holder) { return; }
    holder.querySelectorAll('video').forEach(fn);
  }

  private tryPlay(video: HTMLVideoElement): void {
    video.play().catch(() => {}); // interrupted play() promises are expected noise
  }

  /**
   * Idle-scheduled autoplay start -- only ever called from autoplay-driven code
   * paths (initial start, effect() toggle-on, focus resume). Hover-triggered
   * playback always uses `tryPlay()` directly, bypassing the scheduler, and
   * must never go through here. Scrolling a row away before the idle slot
   * arrives (see `cancelPendingAutoplayStart`) means it never starts at all --
   * a fast scroll-through never pays for decode on rows already passed.
   */
  private tryAutoplayStart(video: HTMLVideoElement): void {
    if (this.pendingAutoplayStarts.has(video)) {
      return; // already scheduled
    }
    const cancel = this.scheduler.schedule(() => {
      this.pendingAutoplayStarts.delete(video);
      if (this.autoplay()) {
        this.tryPlay(video);
      }
    });
    this.pendingAutoplayStarts.set(video, cancel);
  }

  private cancelPendingAutoplayStart(video: HTMLVideoElement): void {
    const cancel = this.pendingAutoplayStarts.get(video);
    if (cancel) {
      cancel();
      this.pendingAutoplayStarts.delete(video);
    }
  }

  /**
   * Map a clicked cell to the timestamp in the SOURCE video:
   * snippet i was extracted at (i + 1) * duration / (snippets + 1)  -- see main-extract.ts
   */
  private segmentSourceTime(segmentIndex: number): number {
    return (segmentIndex + 1) * this.video().duration / ((this.clipSnippets() || 1) + 1);
  }

  private segmentIndexFromEvent(event: MouseEvent): number {
    const target = event.target;
    if (target instanceof HTMLVideoElement && target.dataset.seg !== undefined) {
      return parseInt(target.dataset.seg, 10);
    }
    return undefined;
  }

  cellClick(event: MouseEvent, doubleClick: boolean = false): void {
    const idx = this.segmentIndexFromEvent(event);
    this.videoClick.emit({
      mouseEvent: <PointerEvent>event,
      doubleClick: doubleClick,
      timeSeconds: idx !== undefined ? this.segmentSourceTime(idx) : undefined,
    });
  }

  cellRightClick(event: MouseEvent): void {
    this.rightClick.emit({ mouseEvent: <PointerEvent>event, item: this.video() });
  }

  toggleHeart(mouseClick: PointerEvent): void {
    mouseClick.stopPropagation();
    this.imageElementService.toggleHeart(this.video().index);
  }

}
