import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { galleryItemAppear, metaAppear, textAppear } from '../../common/animations';

@Component({
  selector: 'app-full-item',
  templateUrl: './full.component.html',
  styleUrls: ['./full.component.scss'],
  animations: [ galleryItemAppear,
                textAppear,
                metaAppear ]
})
export class FullViewComponent implements OnInit {

  @ViewChild('filmstripHolder') filmstripHolder: ElementRef;
  @ViewChild('metaContainer') metaContainer: ElementRef;

  @Input() darkMode: boolean;
  @Input() elHeight: number;
  @Input() fileSize: number;
  @Input() folderPath: string;
  @Input() hubName: string;
  @Input() imgHeight: number;
  @Input() imgId: any;
  @Input() largerFont: boolean;
  @Input() numOfScreenshots: number;
  @Input() rez: string;
  @Input() showMeta: boolean;
  @Input() time: string;
  @Input() title: string;

  fullFilePath: string = '';
  filmXoffset: number = 0;

  computedWidth: number;
  rowOffsets: number[];

  constructor(
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.fullFilePath =  'file://' + this.folderPath + '/' + 'vha-' + this.hubName + '/' + this.imgId + '.jpg';

    const imgWidth = this.imgHeight * 16 / 9;
    const metaWidth = this.metaContainer.nativeElement.getBoundingClientRect().width;

    const imagesPerRow = Math.floor(metaWidth / imgWidth);

    this.computedWidth = imgWidth * imagesPerRow;

    const numOfRows = Math.ceil(this.numOfScreenshots / imagesPerRow);

    console.log(numOfRows);
    this.rowOffsets = [];
    for (let i = 0; i < numOfRows; i++) {
      this.rowOffsets.push(i * Math.floor(metaWidth / imgWidth));
    }
    console.log(this.rowOffsets);
  }
}
