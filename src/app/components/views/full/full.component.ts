import type { OnInit} from '@angular/core';
import { Component, Input, input, output } from '@angular/core';

import { FilePathService } from '../file-path.service';

import { metaAppear, textAppear } from '../../../common/animations';

import type { ImageElement } from '../../../../../interfaces/final-object.interface';
import { ImageElementService } from './../../../services/image-element.service';
import type { RightClickEmit, VideoClickEmit } from '../../../../../interfaces/shared-interfaces';

@Component({
  standalone: false,
  selector: 'app-full-item',
  templateUrl: './full.component.html',
  styleUrls: [
      '../time-and-rez.scss',
      '../film-and-full.scss',
      '../selected.scss'
    ],
  animations: [ textAppear, metaAppear ]
})
export class FullViewComponent implements OnInit {

  readonly videoClick = output<VideoClickEmit>();
  readonly rightClick = output<RightClickEmit>();

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

  readonly video = input<ImageElement>(undefined);

  readonly darkMode = input<boolean>(undefined);
  readonly elHeight = input<number>(undefined);
  readonly folderPath = input<string>(undefined);
  readonly hubName = input<string>(undefined);
  readonly largerFont = input<boolean>(undefined);
  readonly showMeta = input<boolean>(undefined);
  readonly showFavorites = input<boolean>(undefined);

  _imgHeight: number;
  _metaWidth: number;
  computedWidth: number;
  fullFilePath = '';
  rowOffsets: number[];

  constructor(
    public filePathService: FilePathService,
    public imageElementService: ImageElementService
  ) { }

  ngOnInit() {
    this.fullFilePath = this.filePathService.createFilePath(this.folderPath(), this.hubName(), 'filmstrips', this.video().hash);
    this.render();
  }

  render(): void {
    const imgWidth = this._imgHeight * 16 / 9;
    const imagesPerRow = Math.floor(this._metaWidth / imgWidth) || 1; // never let this be zero
    this.computedWidth = imgWidth * imagesPerRow;
    const numOfRows = Math.ceil((<any>(this.video() || {screens: 0}).screens) / imagesPerRow);
    this.rowOffsets = [];
    for (let i = 0; i < numOfRows; i++) {
      this.rowOffsets.push(i * Math.floor(this._metaWidth / imgWidth));
    }
  }

  toggleHeart(mouseClick: MouseEvent): void {
    mouseClick.stopPropagation();
    this.imageElementService.toggleHeart(this.video().index);
  }
}
