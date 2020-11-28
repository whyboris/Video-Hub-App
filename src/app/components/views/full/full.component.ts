import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { FilePathService } from '../file-path.service';
import { StarRatingService } from '../../../pipes/star-rating.service';

import { metaAppear, textAppear } from '../../../common/animations';

import { ImageElement } from '../../../../../interfaces/final-object.interface';
import { RightClickEmit, VideoClickEmit } from '../../../../../interfaces/shared-interfaces';

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
  fullFilePath: string = '';
  rowOffsets: number[];

  constructor(
    public filePathService: FilePathService,
    public sanitizer: DomSanitizer,
    private starRatingService: StarRatingService
  ) { }

  ngOnInit() {
    this.fullFilePath = this.filePathService.createFilePath(this.folderPath, this.hubName, 'filmstrips', this.video.hash);
    this.render();
    this.starRatingService.changeStarRating(this.video.stars, this.video.index);
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
