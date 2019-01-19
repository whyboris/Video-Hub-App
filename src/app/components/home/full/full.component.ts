import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { ImageElement } from '../../common/final-object.interface';

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

  @Input() video: ImageElement;

  @Input() darkMode: boolean;
  @Input() elHeight: number;
  @Input() folderPath: string;
  @Input() hubName: string;
  @Input() largerFont: boolean;
  @Input() showMeta: boolean;

  _imgHeight: number;
  _metaWidth: number;
  computedWidth: number;
  fullFilePath: string = '';
  rowOffsets: number[];

  constructor(
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.fullFilePath = 'file://' + this.folderPath + '/' + 'vha-' + this.hubName + '/filmstrips/' + this.video.hash + '.jpg';
    this.render();
  }

  render(): void {
    const imgWidth = this._imgHeight * 16 / 9;
    const imagesPerRow = Math.floor(this._metaWidth / imgWidth) || 1; // never let this be zero
    this.computedWidth = imgWidth * imagesPerRow;
    console.log(this.video);
    // !!! WARNING !!! ### !!! ??? WHY IS `video` undefined sometimes in this view?
    // TODO -- investigate why `video` is sometimes undefined!
    const numOfRows = Math.ceil((<any>(this.video || {screens: 0}).screens) / imagesPerRow);
    this.rowOffsets = [];
    for (let i = 0; i < numOfRows; i++) {
      this.rowOffsets.push(i * Math.floor(this._metaWidth / imgWidth));
    }
  }
}
