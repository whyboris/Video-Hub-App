import { Component, HostListener, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
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


  @Input() darkMode: boolean;
  @Input() elHeight: number;
  @Input() elWidth: number;
  @Input() fileSize: number;
  @Input() folderPath: string;
  @Input() hoverScrub: boolean;
  @Input() hubName: string;
  @Input() imgHeight: number;
  @Input() imgId: any; // the filename of screenshot strip without `.jpg`
  @Input() largerFont: boolean;
  @Input() numOfScreenshots: number;
  @Input() randomImage: boolean; // all code related to this currently removed
  @Input() returnToFirstScreenshot: boolean;
  @Input() rez: string;
  @Input() showMeta: boolean;
  @Input() time: number;
  @Input() title: string;

  percentOffset: number = 0;
  fullFilePath = '';
  thumbnailsToDisplay = 4;

  constructor(
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.fullFilePath =  'file://' + this.folderPath + '/' + 'vha-' + this.hubName + '/' + this.imgId + '.jpg';
    this.percentOffset = (100 / (this.numOfScreenshots - 1));
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
