import { ChangeDetectorRef, ElementRef, input, output } from '@angular/core';
import type { OnDestroy, OnInit } from '@angular/core';
import { Component, HostListener, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { FilePathService } from '../file-path.service';
import { ImageElementService } from './../../../services/image-element.service';
import { VideoAutoplaySchedulerService } from './../../../services/video-autoplay-scheduler.service';

import type { ImageElement } from '../../../../../interfaces/final-object.interface';
import type { RightClickEmit, VideoClickEmit } from '../../../../../interfaces/shared-interfaces';

import { metaAppear, textAppear } from '../../../common/animations';

@Component({
  standalone: false,
  selector: 'app-clip-item',
  templateUrl: './clip.component.html',
  styleUrls: [
      '../clip-and-preview.scss',
      '../time-and-rez.scss',
      './clip.component.scss',
      '../selected.scss'
    ],
  animations: [ textAppear, metaAppear ]
})
export class ClipComponent implements OnInit, OnDestroy {

  readonly rightClick = output<RightClickEmit>();
  readonly sheetClick = output<any>(); // does not emit data of any kind
  readonly videoClick = output<VideoClickEmit>();

  @Input() video: ImageElement;

  readonly autoplay = input<boolean>();
  readonly compactView = input<boolean>();
  readonly darkMode = input<boolean>();
  readonly elHeight = input<number>();
  readonly elWidth = input<number>();
  readonly folderPath = input<string>();
  readonly forceMute = input<boolean>();
  readonly defaultThumbnailMode = input<boolean>();
  readonly returnToFirstScreenshot = input<boolean>();
  readonly hubName = input<string>();
  readonly imgHeight = input<number>();
  readonly largerFont = input<boolean>();
  readonly showMeta = input<boolean>();

  appInFocus = true;
  folderPosterPaths: string[] = [];
  folderThumbPaths: string[] = [];
  hover: boolean;
  noError = true;
  pathToVideo = '';
  poster: string;
  posterFolderType: any = 'clips';

  // cancel functions for scheduled-but-not-yet-started autoplay begins, keyed by
  // the <video> they belong to, so a row that scrolls away before its idle slot
  // arrives never actually starts decoding (hover-triggered playback bypasses
  // this scheduler entirely and is never tracked here)
  private pendingAutoplayStarts = new Map<HTMLVideoElement, () => void>();

  constructor(
    public cd: ChangeDetectorRef,
    private elementRef: ElementRef<HTMLElement>,
    public filePathService: FilePathService,
    public imageElementService: ImageElementService,
    public sanitizer: DomSanitizer,
    private scheduler: VideoAutoplaySchedulerService,
  ) { }

  @HostListener('mouseenter') onMouseEnter() {
    this.hover = true;
  }
  @HostListener('mouseleave') onMouseLeave() {
    this.hover = false;
  }
  @HostListener('window:blur', ['$event'])
  onBlur(event: any): void {
    this.appInFocus = false;
    // Angular's `@if(autoplay() && appInFocus)` is about to remove these video
    // elements entirely -- cancel any not-yet-fired scheduled starts.
    this.cancelAllPendingAutoplayStarts();
  }
  @HostListener('window:focus', ['$event'])
  onFocus(event: any): void {
    this.appInFocus = true;
  }

  stopPreview(event): any {
    if (this.defaultThumbnailMode() && this.returnToFirstScreenshot()) {
      event.target.load(); // Reload original thumbnail
    } else {
      event.target.pause();
    }
  }

  /**
   * Bound to `(loadeddata)` on every autoplay-mode <video> (folder previews +
   * single clip). Defers the actual `.play()` to idle time via the scheduler --
   * a fast scroll-through never pays for decode on rows already scrolled past
   * (the scheduled start is cancelled on destroy/blur before it fires), but
   * nothing is ever permanently blocked: once idle, every visible video plays.
   * Hovering (see template) always plays immediately regardless of this.
   */
  onAutoplayReady(event: Event): void {
    const video = event.target as HTMLVideoElement;
    if (this.pendingAutoplayStarts.has(video)) {
      return; // already scheduled (e.g. metadata re-fired)
    }
    const cancel = this.scheduler.schedule(() => {
      this.pendingAutoplayStarts.delete(video);
      if (this.autoplay() && this.appInFocus) {
        video.play().catch(() => {});
      }
    });
    this.pendingAutoplayStarts.set(video, cancel);
  }

  private cancelAllPendingAutoplayStarts(): void {
    this.pendingAutoplayStarts.forEach((cancel) => cancel());
    this.pendingAutoplayStarts.clear();
  }

  ngOnDestroy(): void {
    this.cancelAllPendingAutoplayStarts();
    // deterministically release decoders rather than relying solely on Angular's
    // DOM removal (matches segments.component's teardown)
    this.elementRef.nativeElement.querySelectorAll('video').forEach((v: HTMLVideoElement) => {
      v.pause();
      v.removeAttribute('src');
      v.load();
    });
  }

  ngOnInit() {

    if (this.defaultThumbnailMode()) {
      this.posterFolderType = 'thumbnails';
    }

    // multiple hashes?
    if (this.video.hash.indexOf(':') !== -1) {
      const hashes = this.video.hash.split(':');

      hashes.slice(0, 4).forEach((hash) => {
        const folderPath = this.folderPath();
        const hubName = this.hubName();
        this.folderThumbPaths.push( this.filePathService.createFilePath(folderPath, hubName, 'clips', hash, true));
        this.folderPosterPaths.push(this.filePathService.createFilePath(folderPath, hubName, this.posterFolderType, hash));
      });
    } else {
      if (this.video.hash === undefined) {
        this.noError = false;
      }
      this.pathToVideo = this.filePathService.createFilePath(this.folderPath(), this.hubName(), 'clips', this.video.hash, true);
      this.poster =      this.filePathService.createFilePath(this.folderPath(), this.hubName(), this.posterFolderType, this.video.hash);

      this.folderThumbPaths.push(this.pathToVideo);
      this.folderPosterPaths.push(this.poster);
    }
  }

  toggleHeart(mouseClick: PointerEvent): void {
    mouseClick.stopPropagation();
    this.imageElementService.toggleHeart(this.video.index);
  }

}
