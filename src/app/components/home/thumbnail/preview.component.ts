import { Component, Input, Output, EventEmitter, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { galleryItemAppear, metaAppear, textAppear } from '../../common/animations';
import { ImageElement } from '../../common/final-object.interface';

@Component({
  selector: 'app-gallery-item',
  templateUrl: './preview.component.html',
  styleUrls: [ './preview.component.scss' ],
  animations: [ galleryItemAppear,
                textAppear,
                metaAppear ]
})
export class PreviewComponent implements OnInit, OnDestroy {

  @ViewChild('filmstripHolder', { static: false }) filmstripHolder: ElementRef;

  @Output() videoClick = new EventEmitter<object>();
  @Output() sheetClick = new EventEmitter<object>();

  @Input() video: ImageElement;

  @Input() darkMode: boolean;
  @Input() elHeight: number;
  @Input() elWidth: number;
  @Input() folderPath: string;
  @Input() hoverScrub: boolean;
  @Input() hubName: string;
  @Input() imgHeight: number;
  @Input() largerFont: boolean;
  @Input() randomImage: boolean; // all code related to this currently removed
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

  constructor() { }

  ngOnInit() {
    // multiple hashes == folder view
    if (this.video.hash.indexOf(':') !== -1) {
      const hashes = this.video.hash.split(':');
      this.shuffle(hashes).slice(0, 4).forEach((hash) => {
        this.folderThumbPaths.push('file://' + this.folderPath + '/' + 'vha-' + this.hubName + '/thumbnails/' + hash + '.jpg');
      });
    } else {
      this.firstFilePath = 'file://' + this.folderPath + '/' + 'vha-' + this.hubName + '/thumbnails/' + this.video.hash + '.jpg';
      this.fullFilePath =  'file://' + this.folderPath + '/' + 'vha-' + this.hubName + '/filmstrips/' + this.video.hash + '.jpg';
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

  /**
   * Used to choose random screenshots for the folder view
   * @param a - a string of hashes to choose from
   */
  shuffle(a: string[]): string[] {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
  }

  ngOnDestroy() {
    clearInterval(this.scrollInterval);
  }

}
