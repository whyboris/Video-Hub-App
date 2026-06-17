import type { OnInit, ElementRef} from '@angular/core';
import { Component, ViewChild, input, output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import type { BehaviorSubject } from 'rxjs';

import { FilePathService } from '../file-path.service';
import { ManualTagsService } from '../../tags-manual/manual-tags.service';

import type { StarRating, ImageElement } from '../../../../../interfaces/final-object.interface';
import type { VideoClickEmit, RightClickEmit, TagEmit, RenameFileResponse } from '../../../../../interfaces/shared-interfaces';
import { ImageElementService } from './../../../services/image-element.service';

export interface YearEmission {
  index: number;
  year: number;
}

@Component({
  standalone: false,
  selector: 'app-details-item',
  templateUrl: './details.component.html',
  styleUrls: [
      '../time-and-rez.scss',
      './details.component.scss',
      '../selected.scss'
    ]
})
export class DetailsComponent implements OnInit {

  @ViewChild('filmstripHolder', { static: false }) filmstripHolder: ElementRef;

  readonly filterTag = output<TagEmit>();
  readonly videoClick = output<VideoClickEmit>();
  readonly rightClick = output<RightClickEmit>();

  readonly video = input<ImageElement>(undefined);

  readonly maxWidth = input<number>(undefined);

  readonly showTwoColumns = input<boolean>(undefined);

  readonly darkMode = input<boolean>(undefined);
  readonly elHeight = input<number>(undefined);
  readonly elWidth = input<number>(undefined);
  readonly folderPath = input<string>(undefined);
  readonly hoverScrub = input<boolean>(undefined);
  readonly hubName = input<string>(undefined);
  readonly imgHeight = input<number>(undefined);
  readonly largerFont = input<boolean>(undefined);
  readonly returnToFirstScreenshot = input<boolean>(undefined);
  readonly selectedSourceFolder = input<string>(undefined);
  readonly showAutoFileTags = input<boolean>(undefined);
  readonly showAutoFolderTags = input<boolean>(undefined);
  readonly showManualTags = input<boolean>(undefined);
  readonly showMeta = input<boolean>(undefined);
  readonly showVideoNotes = input<boolean>(undefined);
  readonly showFavorites = input<boolean>(undefined);
  readonly star = input<StarRating>(undefined);

  readonly renameResponse = input<BehaviorSubject<RenameFileResponse>>(undefined);

  containerWidth: number;
  filmstripPath = '';
  firstFilePath = '';
  hover: boolean;
  indexToShow = 1;
  percentOffset = 0;
  starRatingHack: StarRating; // updates visuals of rating

  constructor(
    public filePathService: FilePathService,
    public imageElementService: ImageElementService,
    public manualTagsService: ManualTagsService,
    public sanitizer: DomSanitizer
  ) { }

  mouseEnter() {
    if (this.hoverScrub()) {
      this.containerWidth = this.filmstripHolder.nativeElement.getBoundingClientRect().width;
      this.hover = true;
    }
  }

  mouseLeave() {
    if (this.hoverScrub() && this.returnToFirstScreenshot()) {
      this.hover = false;
      const video = this.video();
      this.percentOffset = (video.defaultScreen !== undefined)
                           ? this.getDefaultScreenOffset(video)
                           : 0;
    }
  }

  getDefaultScreenOffset(video: ImageElement): number {
    return 100 * video.defaultScreen / (video.screens - 1);
  }

  toggleHeart(): void {
    const video = this.video();
    this.imageElementService.toggleHeart(video.index);
    this.starRatingHack = video.stars;
    event.stopPropagation();
  }

  ngOnInit() {
    this.firstFilePath = this.filePathService.createFilePath(this.folderPath(), this.hubName(), 'thumbnails', this.video().hash);
    this.filmstripPath =  this.filePathService.createFilePath(this.folderPath(), this.hubName(), 'filmstrips', this.video().hash);
    const video = this.video();
    if (video.defaultScreen !== undefined) {
      this.percentOffset = this.getDefaultScreenOffset(video);
    }
  }

  mouseIsMoving($event) {
    if (this.hoverScrub()) {
      const cursorX = $event.layerX;
      this.indexToShow = Math.floor(cursorX * (this.video().screens / this.containerWidth));
      this.percentOffset = this.indexToShow * (100 / (this.video().screens - 1));
    }
  }
}
