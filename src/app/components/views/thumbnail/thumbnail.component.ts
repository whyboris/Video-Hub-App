import type { OnInit, ElementRef, OnDestroy } from '@angular/core';
import { Component, Input, input, output, viewChild } from '@angular/core';

import { FilePathService } from '../file-path.service';
import { ImageElementService } from './../../../services/image-element.service';

import { metaAppear, textAppear } from '../../../common/animations';

import type { ImageElement } from '@my/final-object.interface';
import type { VideoClickEmit, RightClickEmit } from '@my/shared-interfaces';

@Component({
  standalone: false,
  selector: 'app-thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: [
    '../clip-and-preview.scss',
    '../time-and-rez.scss',
    './thumbnail.component.scss',
    '../selected.scss'
  ],
  animations: [textAppear, metaAppear]
})
export class ThumbnailComponent implements OnInit, OnDestroy {

  readonly filmstripHolder = viewChild<ElementRef>('filmstripHolder');

  readonly sheetClick = output<any>(); // does not emit data of any kind
  readonly videoClick = output<VideoClickEmit>();
  readonly rightClick = output<RightClickEmit>();

  @Input() video: ImageElement;

  readonly compactView = input<boolean>(undefined);
  readonly connected = input<boolean>(undefined);
  readonly darkMode = input<boolean>(undefined);
  readonly elHeight = input<number>(undefined);
  readonly elWidth = input<number>(undefined);
  readonly folderPath = input<string>(undefined);
  readonly hoverScrub = input<boolean>(undefined);
  readonly hubName = input<string>(undefined);
  readonly imgHeight = input<number>(undefined);
  readonly largerFont = input<boolean>(undefined);
  readonly returnToFirstScreenshot = input<boolean>(undefined);
  @Input() showMeta: boolean;
  readonly thumbAutoAdvance = input<boolean>(undefined);
  readonly showFavorites = input<boolean>(undefined);

  containerWidth: number;
  firstFilePath = '';
  folderThumbPaths: string[] = [];
  fullFilePath = '';
  hover: boolean;
  indexToShow = 1;
  percentOffset = 0;
  scrollInterval: any = null;

  constructor(
    public filePathService: FilePathService,
    public imageElementService: ImageElementService,
  ) { }

  ngOnInit() {
    // multiple hashes == folder view
    if (this.video.hash.indexOf(':') !== -1) {
      const hashes = this.video.hash.split(':');
      hashes.slice(0, 4).forEach((hash) => {
        this.folderThumbPaths.push(this.filePathService.createFilePath(this.folderPath(), this.hubName(), 'thumbnails', hash));
      });
    } else {
      this.firstFilePath = this.filePathService.createFilePath(this.folderPath(), this.hubName(), 'thumbnails', this.video.hash);
      this.fullFilePath = this.filePathService.createFilePath(this.folderPath(), this.hubName(), 'filmstrips', this.video.hash);
      this.folderThumbPaths.push(this.firstFilePath);
    }

    if (this.video.defaultScreen) {
      this.hover = true;
      this.percentOffset = this.defaultScreenOffset(this.video);
    }
  }

  defaultScreenOffset(video: ImageElement): number {
    return 100 * video.defaultScreen / (video.screens - 1);
  }

  mouseEntered() {
    this.containerWidth = this.filmstripHolder().nativeElement.getBoundingClientRect().width;

    if (this.thumbAutoAdvance()) {
      this.hover = true;

      this.scrollInterval = setInterval(() => {
        this.percentOffset = this.indexToShow * (100 / (this.video.screens - 1));
        this.indexToShow++;
      }, 750);

    } else if (this.hoverScrub()) {
      this.hover = true;
    }
  }

  mouseLeft() {
    if (this.thumbAutoAdvance()) {
      clearInterval(this.scrollInterval);
    }

    if (this.returnToFirstScreenshot()) {
      if (this.video.defaultScreen !== undefined) {
        this.percentOffset = this.defaultScreenOffset(this.video);
      } else {
        this.hover = false;
        this.percentOffset = 0;
      }
    }
  }

  mouseIsMoving($event: any) {
    if (this.hoverScrub()) {
      const cursorX = $event.layerX;
      this.indexToShow = Math.floor(cursorX * (this.video.screens / this.containerWidth));
      this.percentOffset = this.indexToShow * (100 / (this.video.screens - 1));
    }
  }

  ngOnDestroy() {
    clearInterval(this.scrollInterval);
  }

  toggleHeart(): void {
    this.imageElementService.toggleHeart(this.video.index);
    event.stopPropagation();
  }
}
