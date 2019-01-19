import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { ImageElement } from '../../common/final-object.interface';

import { galleryItemAppear, metaAppear, textAppear } from '../../common/animations';

@Component({
  selector: 'app-thumbnail-sheet',
  templateUrl: './sheet.component.html',
  styleUrls: [ './sheet.component.scss' ],
  animations: [ galleryItemAppear,
                textAppear,
                metaAppear ]
})
export class SheetComponent implements OnInit {

  @ViewChild('filmstripHolder') filmstripHolder: ElementRef;
  @ViewChild('thumbHolder') thumbHolder: ElementRef;

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
  fullFilePath = '';
  thumbnailsToDisplay = 4;

  constructor(
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.fullFilePath =  'file://' + this.folderPath + '/' + 'vha-' + this.hubName + '/filmstrips/' + this.video.hash + '.jpg';
    this.percentOffset = (100 / (this.video.screens - 1));
  }

  decreaseZoomLevel() {
    if (this.thumbnailsToDisplay > 1) {
      this.thumbnailsToDisplay++;
    }
  }

  resetZoomLevel() {
    this.thumbnailsToDisplay = 4;
  }

  increaseZoomLevel() {
    if (this.thumbnailsToDisplay < 10) {
      this.thumbnailsToDisplay--;
    }
  }
}
