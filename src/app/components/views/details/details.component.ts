import type { OnInit, ElementRef} from '@angular/core';
import { Component, Input, ViewChild, Output, EventEmitter } from '@angular/core';
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
  selector: 'app-details-item',
  templateUrl: './details.component.html',
  styleUrls: [
      './details.component.scss',
      '../selected.scss'
    ]
})
export class DetailsComponent implements OnInit {

  @ViewChild('filmstripHolder', { static: false }) filmstripHolder: ElementRef;

  @Output() filterTag = new EventEmitter<TagEmit>();
  @Output() videoClick = new EventEmitter<VideoClickEmit>();
  @Output() rightClick = new EventEmitter<RightClickEmit>();

  @Input() video: ImageElement;

  @Input() maxWidth: number;

  @Input() showTwoColumns: boolean;

  @Input() darkMode: boolean;
  @Input() elHeight: number;
  @Input() elWidth: number;
  @Input() folderPath: string;
  @Input() hoverScrub: boolean;
  @Input() hubName: string;
  @Input() imgHeight: number;
  @Input() largerFont: boolean;
  @Input() returnToFirstScreenshot: boolean;
  @Input() selectedSourceFolder: string;
  @Input() showAutoFileTags: boolean;
  @Input() showAutoFolderTags: boolean;
  @Input() showManualTags: boolean;
  @Input() showMeta: boolean;
  @Input() showVideoNotes: boolean;
  @Input() showFavorites: boolean;
  @Input() star: StarRating;
  // @Input() starRatingHack: StarRating;
  // @Input() heartLitHack: boolean;
  starRatingHack: StarRating;

  @Input() renameResponse: BehaviorSubject<RenameFileResponse>;

  containerWidth: number;
  filmstripPath = '';
  firstFilePath = '';
  hover: boolean;
  indexToShow = 1;
  percentOffset = 0;
  heartLitHack: boolean; // true if stars == 5.5, false otherwise

  constructor(
    public filePathService: FilePathService,
    public imageElementService: ImageElementService,
    public manualTagsService: ManualTagsService,
    public sanitizer: DomSanitizer
  ) { }

  mouseEnter() {
    if (this.hoverScrub) {
      this.containerWidth = this.filmstripHolder.nativeElement.getBoundingClientRect().width;
      this.hover = true;
    }
  }

  mouseLeave() {
    if (this.hoverScrub && this.returnToFirstScreenshot) {
      this.hover = false;
      this.percentOffset = (this.video.defaultScreen !== undefined)
                           ? this.getDefaultScreenOffset(this.video)
                           : 0;
    }
  }

  getDefaultScreenOffset(video: ImageElement): number {
    return 100 * video.defaultScreen / (video.screens - 1);
  }

  ngOnInit() {
    this.firstFilePath = this.filePathService.createFilePath(this.folderPath, this.hubName, 'thumbnails', this.video.hash);
    this.filmstripPath =  this.filePathService.createFilePath(this.folderPath, this.hubName, 'filmstrips', this.video.hash);
    if (this.video.defaultScreen !== undefined) {
      this.percentOffset = this.getDefaultScreenOffset(this.video);
    }

    this.heartLitHack = this.video.stars == 5.5;
    this.starRatingHack = this.video.stars;
  }

  mouseIsMoving($event) {
    if (this.hoverScrub) {
      const cursorX = $event.layerX;
      this.indexToShow = Math.floor(cursorX * (this.video.screens / this.containerWidth));
      this.percentOffset = this.indexToShow * (100 / (this.video.screens - 1));
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
      this.starRatingHack = 0.5;
    } else { // "favorite" the video
      this.imageElementService.HandleEmission({
        index: this.video.index,
        stars: 5.5,
      });
      this.heartLitHack = true;
      this.starRatingHack = 5.5;
    }
    // stop event propagation (such as opening the video)
    event.stopImmediatePropagation();
    console.log("\nNow rating:");
    console.log(this.video.stars);
  }
}
