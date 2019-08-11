import { Component, Input, Output, EventEmitter, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';

import { FilePathService } from '../file-path.service';

import { metaAppear, textAppear } from '../../../common/animations';

import { ImageElement } from '../../../common/final-object.interface';

@Component({
  selector: 'app-gallery-item',
  templateUrl: './preview.component.html',
  styleUrls: [
      '../clip-and-preview.scss',
      '../time-and-rez.scss',
      './preview.component.scss',
    ],
  animations: [ textAppear,
                metaAppear ]
})
export class PreviewComponent implements OnInit, OnDestroy {

  @ViewChild('filmstripHolder', { static: false }) filmstripHolder: ElementRef;

  @Output() videoClick = new EventEmitter<object>();
  @Output() sheetClick = new EventEmitter<object>();
  @Output() rightClick = new EventEmitter<object>();

  @Input() video: ImageElement;

  @Input() compactView: boolean;
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
    public filePathService: FilePathService
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
      this.hover = false;
      this.percentOffset = 0;
    }
  }

  mouseIsMoving($event) {
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
