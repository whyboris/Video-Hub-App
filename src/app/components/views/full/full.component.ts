import type { OnInit} from '@angular/core';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import type { DomSanitizer } from '@angular/platform-browser';

import type { FilePathService } from '../file-path.service';

import { metaAppear, textAppear } from '../../../common/animations';

import type { ImageElement } from '../../../../../interfaces/final-object.interface';
import type { RightClickEmit, VideoClickEmit } from '../../../../../interfaces/shared-interfaces';

@Component({
  selector: 'app-full-item',
  templateUrl: './full.component.html',
  styleUrls: [
      '../film-and-full.scss',
      '../selected.scss'
    ],
  animations: [ textAppear,
                metaAppear ]
})
export class FullViewComponent implements OnInit {

  @Output() videoClick = new EventEmitter<VideoClickEmit>();
  @Output() rightClick = new EventEmitter<RightClickEmit>();

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
  fullFilePath = '';
  rowOffsets: number[];

  constructor(
    public filePathService: FilePathService,
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.fullFilePath = this.filePathService.createFilePath(this.folderPath, this.hubName, 'filmstrips', this.video.hash);
    this.render();
  }

  render(): void {
    const imgWidth = this._imgHeight * 16 / 9;
    const imagesPerRow = Math.floor(this._metaWidth / imgWidth) || 1; // never let this be zero
    this.computedWidth = imgWidth * imagesPerRow;
    const numOfRows = Math.ceil((<any>(this.video || {screens: 0}).screens) / imagesPerRow);
    this.rowOffsets = [];
    for (let i = 0; i < numOfRows; i++) {
      this.rowOffsets.push(i * Math.floor(this._metaWidth / imgWidth));
    }
  }
}
