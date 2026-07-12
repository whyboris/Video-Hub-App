import type { AfterViewInit, OnDestroy, OnInit} from '@angular/core';
import { ChangeDetectorRef, Component, ElementRef, Input, input, output } from '@angular/core';

import { FilePathService } from '../file-path.service';

import { metaAppear, textAppear } from '../../../common/animations';

import type { ImageElement } from '../../../../../interfaces/final-object.interface';
import { ImageElementService } from './../../../services/image-element.service';
import type { RightClickEmit, VideoClickEmit } from '../../../../../interfaces/shared-interfaces';

@Component({
  standalone: false,
  selector: 'app-full-item',
  templateUrl: './full.component.html',
  styleUrls: [
      '../time-and-rez.scss',
      '../film-and-full.scss',
      '../selected.scss'
    ],
  animations: [ textAppear, metaAppear ]
})
export class FullViewComponent implements OnInit, AfterViewInit, OnDestroy {

  readonly videoClick = output<VideoClickEmit>();
  readonly rightClick = output<RightClickEmit>();

  @Input()
  set galleryWidth(galleryWidth: number) {
    this._metaWidth = galleryWidth;
    this.render();
  }

  @Input()
  set imgHeight(imageHeight: number) {
    this._imgHeight = imageHeight;
    this.render();
  }

  readonly video = input<ImageElement>();

  readonly darkMode = input<boolean>();
  readonly elHeight = input<number>();
  readonly folderPath = input<string>();
  readonly hubName = input<string>();
  readonly largerFont = input<boolean>();
  readonly showMeta = input<boolean>();
  readonly showFavorites = input<boolean>();

  _imgHeight: number;
  _metaWidth: number;
  computedWidth: number;
  fullFilePath = '';
  rowOffsets: number[];

  // when false, the background-image is unset -- releases the decoded-image
  // memory + cancels any in-flight fetch for a row that's still mounted but not
  // actually on screen. Restores immediately (no idle delay) once visible again.
  rowVisible = true;

  private intersectionObserver: IntersectionObserver;

  constructor(
    private cd: ChangeDetectorRef,
    private elementRef: ElementRef<HTMLElement>,
    public filePathService: FilePathService,
    public imageElementService: ImageElementService
  ) { }

  ngOnInit() {
    this.fullFilePath = this.filePathService.createFilePath(this.folderPath(), this.hubName(), 'filmstrips', this.video().hash);
    this.render();
  }

  ngAfterViewInit(): void {
    const scrollRoot = this.elementRef.nativeElement.closest('virtual-scroller');
    this.intersectionObserver = new IntersectionObserver((entries) => {
      this.rowVisible = entries[entries.length - 1].isIntersecting;
      this.cd.markForCheck();
    }, { root: scrollRoot, threshold: 0 });
    this.intersectionObserver.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
  }

  render(): void {
    const imgWidth = this._imgHeight * 16 / 9;
    const imagesPerRow = Math.floor(this._metaWidth / imgWidth) || 1; // never let this be zero
    this.computedWidth = imgWidth * imagesPerRow;
    const numOfRows = Math.ceil((<any>(this.video() || {screens: 0}).screens) / imagesPerRow);
    this.rowOffsets = [];
    for (let i = 0; i < numOfRows; i++) {
      this.rowOffsets.push(i * Math.floor(this._metaWidth / imgWidth));
    }
  }

  toggleHeart(mouseClick: PointerEvent): void {
    mouseClick.stopPropagation();
    this.imageElementService.toggleHeart(this.video().index);
  }
}
