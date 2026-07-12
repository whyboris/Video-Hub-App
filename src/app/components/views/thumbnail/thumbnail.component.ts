import type { AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { ChangeDetectorRef, Component, ElementRef, Input, input, output, viewChild } from '@angular/core';

import { FilePathService } from '../file-path.service';

import { metaAppear, textAppear } from '../../../common/animations';

import { ImageElementService } from './../../../services/image-element.service';
import type { ImageElement } from '../../../../../interfaces/final-object.interface';
import type { VideoClickEmit, RightClickEmit } from '../../../../../interfaces/shared-interfaces';

@Component({
  standalone: false,
  selector: 'app-thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: [
    '../clip-and-preview.scss',
    '../time-and-rez.scss',
    './thumbnail.component.scss',
    '../selected.scss'
  ],
  animations: [textAppear, metaAppear]
})
export class ThumbnailComponent implements OnInit, AfterViewInit, OnDestroy {

  readonly filmstripHolder = viewChild<ElementRef>('filmstripHolder');

  readonly refreshPlaylist = output<void>();
  readonly rightClick = output<RightClickEmit>();
  readonly sheetClick = output<void>();
  readonly videoClick = output<VideoClickEmit>();

  readonly heartPressed = output<void>();

  @Input() video: ImageElement;

  readonly compactView = input<boolean>();
  readonly connected = input<boolean>();
  readonly darkMode = input<boolean>();
  readonly elHeight = input<number>();
  readonly elWidth = input<number>();
  readonly folderPath = input<string>();
  readonly hoverScrub = input<boolean>();
  readonly hubName = input<string>();
  readonly imgHeight = input<number>();
  readonly largerFont = input<boolean>();
  readonly returnToFirstScreenshot = input<boolean>();
  readonly showFavorites = input<boolean>();
  readonly showMeta = input<boolean>();
  readonly thumbAutoAdvance = input<boolean>();

  containerWidth = 100; // arbitrary rather than undefined
  firstFilePath = '';
  folderThumbPaths: string[] = [];
  fullFilePath = '';
  hover = false;
  indexToShow = 1;
  percentOffset = 0;
  scrollInterval: any = null;

  // when false, the template shows no image src/background-image at all --
  // releases the decoded-image memory + cancels any in-flight fetch for a row
  // that's still mounted (e.g. briefly during a fast flick-scroll) but not
  // actually on screen. Restores immediately (no idle delay) once visible again,
  // since -- unlike video -- a fast, always-current thumbnail IS the whole point
  // of this view.
  rowVisible = true;

  private intersectionObserver: IntersectionObserver;

  constructor(
    private cd: ChangeDetectorRef,
    private elementRef: ElementRef<HTMLElement>,
    public filePathService: FilePathService,
    public imageElementService: ImageElementService,
  ) { }

  ngAfterViewInit(): void {
    const scrollRoot = this.elementRef.nativeElement.closest('virtual-scroller');
    this.intersectionObserver = new IntersectionObserver((entries) => {
      this.rowVisible = entries[entries.length - 1].isIntersecting;
      this.cd.markForCheck();
    }, { root: scrollRoot, threshold: 0 });
    this.intersectionObserver.observe(this.elementRef.nativeElement);
  }

  ngOnInit() {
    // multiple hashes == folder view
    if (this.video.hash.indexOf(':') !== -1) {
      const hashes = this.video.hash.split(':');
      hashes.slice(0, 4).forEach((hash) => {
        this.folderThumbPaths.push(this.filePathService.createFilePath(this.folderPath(), this.hubName(), 'thumbnails', hash));
      });
    } else {
      this.firstFilePath = this.filePathService.createFilePath(this.folderPath(), this.hubName(), 'thumbnails', this.video.hash);
      this.fullFilePath = this.filePathService.createFilePath(this.folderPath(), this.hubName(), 'filmstrips', this.video.hash);
      this.folderThumbPaths.push(this.firstFilePath);
    }

    if (this.video.defaultScreen) {
      this.hover = true;
      this.percentOffset = this.defaultScreenOffset(this.video);
    }
  }

  defaultScreenOffset(video: ImageElement): number {
    return 100 * video.defaultScreen / video.screens;
  }

  mouseEntered() {
    this.containerWidth = this.filmstripHolder().nativeElement.getBoundingClientRect().width;

    if (this.thumbAutoAdvance()) {
      this.hover = true;

      this.scrollInterval = setInterval(() => {
        this.percentOffset = this.indexToShow * (100 / this.video.screens);
        this.indexToShow++;
      }, 750);

    } else if (this.hoverScrub()) {
      this.hover = true;
    }
  }

  mouseLeft() {
    if (this.thumbAutoAdvance()) {
      clearInterval(this.scrollInterval);
    }

    if (this.returnToFirstScreenshot()) {
      if (this.video.defaultScreen !== undefined) {
        this.percentOffset = this.defaultScreenOffset(this.video);
      } else {
        this.hover = false;
        this.percentOffset = 0;
      }
    }
  }

  mouseIsMoving($event: any) {
    if (this.hoverScrub()) {
      const cursorX = $event.layerX;
      this.indexToShow = Math.floor(cursorX * (this.video.screens / this.containerWidth));
      this.percentOffset = this.indexToShow * (100 / this.video.screens);
    }
  }

  ngOnDestroy() {
    clearInterval(this.scrollInterval);
    this.intersectionObserver?.disconnect();
  }

  openDetailsView(leftClick: PointerEvent): void {
    leftClick.stopPropagation()

    this.sheetClick.emit();
  }

  toggleHeart(leftClick: PointerEvent): void {
    leftClick.stopPropagation();

    this.imageElementService.toggleHeart(this.video.index);
    this.heartPressed.emit();
  }

  togglePlaylist(leftClick: PointerEvent): void {
    leftClick.stopPropagation();

    this.imageElementService.updatePlaylist(this.video.index);
    this.refreshPlaylist.emit();
  }

}
