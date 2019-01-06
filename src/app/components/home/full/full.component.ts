import { Component, Input, OnInit } from '@angular/core';
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

  @Input()
  set galleryWidth(galleryWidth: number) {
    this._metaWidth = galleryWidth - 40;
    // 40px is removed as required padding inside the gallery
    this.render();
  }

  @Input()
  set imgHeight(imageHeight: number) {
    this._imgHeight = imageHeight;
    this.render();
  }

  @Input() darkMode: boolean;
  @Input() elHeight: number;
  @Input() fileSize: number;
  @Input() folderPath: string;
  @Input() hubName: string;
  @Input() imgId: any;
  @Input() largerFont: boolean;
  @Input() numOfScreenshots: number;
  @Input() rez: string;
  @Input() showMeta: boolean;
  @Input() time: string;
  @Input() title: string;

  _imgHeight: number;
  _metaWidth: number;
  computedWidth: number;
  fullFilePath: string = '';
  rowOffsets: number[];

  constructor(
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.fullFilePath =  'file://' + this.folderPath + '/' + 'vha-' + this.hubName + '/' + this.imgId + '.jpg';
    this.render();
  }

  render(): void {
    const imgWidth = this._imgHeight * 16 / 9;
    const imagesPerRow = Math.floor(this._metaWidth / imgWidth);
    this.computedWidth = imgWidth * imagesPerRow;
    const numOfRows = Math.ceil(this.numOfScreenshots / imagesPerRow);
    this.rowOffsets = [];
    for (let i = 0; i < numOfRows; i++) {
      this.rowOffsets.push(i * Math.floor(this._metaWidth / imgWidth));
    }
  }
}
