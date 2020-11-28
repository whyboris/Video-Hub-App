import { Component, Input, Output, EventEmitter, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';

import { FilePathService } from '../file-path.service';
import { StarRatingService } from '../../../pipes/star-rating.service';

import { metaAppear, textAppear } from '../../../common/animations';

import { ImageElement } from '../../../../../interfaces/final-object.interface';
import { VideoClickEmit, RightClickEmit } from '../../../../../interfaces/shared-interfaces';

@Component({
  selector: 'app-thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: [
      '../clip-and-preview.scss',
      '../time-and-rez.scss',
      './thumbnail.component.scss',
      '../selected.scss'
    ],
  animations: [ textAppear,
                metaAppear ]
})
export class ThumbnailComponent implements OnInit, OnDestroy {

  @ViewChild('filmstripHolder', { static: false }) filmstripHolder: ElementRef;

  @Output() sheetClick = new EventEmitter<any>(); // does not emit data of any kind
  @Output() videoClick = new EventEmitter<VideoClickEmit>();
  @Output() rightClick = new EventEmitter<RightClickEmit>();

  @Input() video: ImageElement;

  @Input() compactView: boolean;
  @Input() connected: boolean;
  @Input() darkMode: boolean;
  @Input() elHeight: number;
  @Input() elWidth: number;
  @Input() folderPath: string;
  @Input() hoverScrub: boolean;
  @Input() hubName: string;
  @Input() imgHeight: number;
  @Input() largerFont: boolean;
  @Input() returnToFirstScreenshot: boolean;
  @Input() showMeta: boolean;
  @Input() thumbAutoAdvance: boolean;

  containerWidth: number;
  firstFilePath = '';
  folderThumbPaths: string[] = [];
  fullFilePath = '';
  hover: boolean;
  indexToShow: number = 1;
  percentOffset: number = 0;
  scrollInterval: any = null;

  constructor(
    public filePathService: FilePathService,
    private starRatingService: StarRatingService
  ) { }

  ngOnInit() {
    // multiple hashes == folder view
    if (this.video.hash.indexOf(':') !== -1) {
      const hashes = this.video.hash.split(':');
      hashes.slice(0, 4).forEach((hash) => {
        this.folderThumbPaths.push(this.filePathService.createFilePath(this.folderPath, this.hubName, 'thumbnails', hash));
      });
    } else {
      this.firstFilePath = this.filePathService.createFilePath(this.folderPath, this.hubName, 'thumbnails', this.video.hash);
      this.fullFilePath = this.filePathService.createFilePath(this.folderPath, this.hubName, 'filmstrips', this.video.hash);
      this.folderThumbPaths.push(this.firstFilePath);
    }

    if (this.video.defaultScreen) {
      this.hover = true;
      this.percentOffset = this.defaultScreenOffset(this.video);
    }

    this.starRatingService.changeStarRating(this.video.stars, this.video.index);
  }

  defaultScreenOffset(video: ImageElement): number {
    return 100 * video.defaultScreen / (video.screens - 1);
  }

  mouseEntered() {
    this.containerWidth = this.filmstripHolder.nativeElement.getBoundingClientRect().width;

    if (this.thumbAutoAdvance) {
      this.hover = true;

      this.scrollInterval = setInterval(() => {
        this.percentOffset = this.indexToShow * (100 / (this.video.screens - 1));
        this.indexToShow++;
      }, 750);

    } else if (this.hoverScrub) {
      this.hover = true;
    }
  }

  mouseLeft() {
    if (this.thumbAutoAdvance) {
      clearInterval(this.scrollInterval);
    }

    if (this.returnToFirstScreenshot) {
      if (this.video.defaultScreen !== undefined) {
        this.percentOffset = this.defaultScreenOffset(this.video);
      } else {
        this.hover = false;
        this.percentOffset = 0;
      }
    }
  }

  mouseIsMoving($event: any) {
    if (this.hoverScrub) {
      const cursorX = $event.layerX;
      this.indexToShow = Math.floor(cursorX * (this.video.screens / this.containerWidth));
      this.percentOffset = this.indexToShow * (100 / (this.video.screens - 1));
    }
  }

  ngOnDestroy() {
    clearInterval(this.scrollInterval);
  }

}
