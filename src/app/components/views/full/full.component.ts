import type { OnInit} from '@angular/core';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { FilePathService } from '../file-path.service';

import { metaAppear, textAppear } from '../../../common/animations';

import type { ImageElement } from '../../../../../interfaces/final-object.interface';
import { ImageElementService } from './../../../services/image-element.service';
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
  @Input() showFavorites: boolean;

  _imgHeight: number;
  _metaWidth: number;
  computedWidth: number;
  fullFilePath = '';
  rowOffsets: number[];
  heartLitHack: boolean; // true if stars == 5.5, false otherwise

  constructor(
    public filePathService: FilePathService,
    public imageElementService: ImageElementService,
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.fullFilePath = this.filePathService.createFilePath(this.folderPath, this.hubName, 'filmstrips', this.video.hash);
    this.render();

    this.heartLitHack = this.video.stars == 5.5;
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

  toggleHeart(): void {
    console.log("Called toggleHeart()\n");
    console.log("Previous rating:");
    console.log(this.video.stars);
    if (this.video.stars == 5.5) { // "un-favorite" the video
      this.imageElementService.HandleEmission({
        index: this.video.index,
        stars: 0.5,
      });
      this.heartLitHack = false;
    } else { // "favorite" the video
      this.imageElementService.HandleEmission({
        index: this.video.index,
        stars: 5.5,
      });
      this.heartLitHack = true;
    }
    // stop event propagation (such as opening the video)
    event.stopImmediatePropagation();
    console.log("\nNow rating:");
    console.log(this.video.stars);
  }
}
