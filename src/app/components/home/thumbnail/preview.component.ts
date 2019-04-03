import { Component, HostListener, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
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
export class PreviewComponent implements OnInit {

  @ViewChild('filmstripHolder') filmstripHolder: ElementRef;

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

  percentOffset: number = 0;
  firstFilePath = '';
  fullFilePath = '';
  hover: boolean;

  folderThumbPaths = [];
  numberOfThumbs = 0;

  constructor(
    public sanitizer: DomSanitizer
  ) { }

  @HostListener('mouseenter') onMouseEnter() {
    if (this.hoverScrub) {
      this.hover = true;
    }
  }
  @HostListener('mouseleave') onMouseLeave() {
    if (this.hoverScrub && this.returnToFirstScreenshot) {
      this.hover = false;
      this.percentOffset = 0;
    }
  }

  ngOnInit() {
    // multiple hashes?
    if (this.video.hash.indexOf(':') !== -1) {
      console.log('test');
      const hashes = this.video.hash.split(':');
      this.shuffle(hashes).slice(0, 4).forEach((hash) => {
        this.folderThumbPaths.push('file://' + this.folderPath + '/' + 'vha-' + this.hubName + '/thumbnails/' + hash + '.jpg');
      });
      this.numberOfThumbs = this.folderThumbPaths.length;
    } else {
      this.firstFilePath = 'file://' + this.folderPath + '/' + 'vha-' + this.hubName + '/thumbnails/' + this.video.hash + '.jpg';
      this.fullFilePath =  'file://' + this.folderPath + '/' + 'vha-' + this.hubName + '/filmstrips/' + this.video.hash + '.jpg';
      this.folderThumbPaths.push(this.firstFilePath);
      this.numberOfThumbs = 1;
    }
  }

  shuffle(a) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
  }

  mouseIsMoving($event) {
    if (this.hoverScrub) {
      const cursorX = $event.layerX;
      const containerWidth = this.filmstripHolder.nativeElement.getBoundingClientRect().width;

      this.percentOffset = (100 / (this.video.screens - 1)) * Math.floor(cursorX / (containerWidth / this.video.screens));
    }
  }

}
