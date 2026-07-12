import { ChangeDetectorRef, ElementRef, input, output } from '@angular/core';
import type { OnDestroy, OnInit } from '@angular/core';
import { Component, HostListener, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { FilePathService } from '../file-path.service';
import { ImageElementService } from './../../../services/image-element.service';
import { VideoDecodeBudgetService } from './../../../services/video-decode-budget.service';

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

  // videos this component currently holds a decode-budget slot for (autoplay-driven only;
  // hover-triggered playback never requests a slot, so it never appears here)
  private autoplaySlotHeld = new Set<HTMLVideoElement>();

  constructor(
    public cd: ChangeDetectorRef,
    private decodeBudget: VideoDecodeBudgetService,
    private elementRef: ElementRef<HTMLElement>,
    public filePathService: FilePathService,
    public imageElementService: ImageElementService,
    public sanitizer: DomSanitizer
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
    // elements entirely -- release their slots now rather than leaking them.
    this.releaseAllAutoplaySlots();
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
   * Staggered, budget-gated autoplay start. Bound to `(loadeddata)` on every
   * autoplay-mode <video> (folder previews + single clip). If the shared decode
   * budget is exhausted the video simply stays parked on its poster frame --
   * still real video, just not decoding until a slot frees up or it's hovered
   * directly (hover playback bypasses the budget entirely, see template).
   */
  onAutoplayReady(event: Event): void {
    const video = event.target as HTMLVideoElement;
    setTimeout(() => {
      if (!this.autoplay() || !this.appInFocus) {
        return; // state changed during the stagger delay
      }
      if (this.autoplaySlotHeld.has(video)) {
        video.play().catch(() => {});
        return;
      }
      if (!this.decodeBudget.requestSlot()) {
        return;
      }
      this.autoplaySlotHeld.add(video);
      video.play().catch(() => {});
    }, Math.floor(Math.random() * 500));
  }

  private releaseAllAutoplaySlots(): void {
    this.autoplaySlotHeld.forEach(() => this.decodeBudget.releaseSlot());
    this.autoplaySlotHeld.clear();
  }

  ngOnDestroy(): void {
    this.releaseAllAutoplaySlots();
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
