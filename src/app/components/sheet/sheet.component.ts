import type { OnInit, ElementRef} from '@angular/core';
import { Component, input, output, viewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import * as path from 'path';
import type { BehaviorSubject } from 'rxjs';

import { FilePathService } from '../views/file-path.service';
import { ImageElementService } from './../../services/image-element.service';
import { ManualTagsService } from '../tags-manual/manual-tags.service';

import type { StarRating, ImageElement } from '@my/final-object.interface';
import type { TagEmit, RenameFileResponse } from '@my/shared-interfaces';

import { metaAppear, textAppear, modalAnimation } from '../../common/animations';

export interface StarEmission {
  index: number;
  stars: StarRating;
}

export interface DefaultScreenEmission {
  index: number;
  defaultScreen: number;
}

@Component({
  standalone: false,
  selector: 'app-thumbnail-sheet',
  templateUrl: './sheet.component.html',
  styleUrls: [ './../buttons.scss',
               './../views/time-and-rez.scss',
               './sheet.component.scss' ],
  animations: [ modalAnimation, textAppear, metaAppear ]
})
export class SheetComponent implements OnInit {

  readonly filmstripHolder = viewChild<ElementRef>('filmstripHolder');
  readonly thumbHolder = viewChild<ElementRef>('thumbHolder');

  readonly filterTag = output<TagEmit>();
  readonly openVideoAtTime = output<object>();

  readonly video = input<ImageElement>(undefined);

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
  readonly star = input<StarRating>(undefined);

  readonly renameResponse = input<BehaviorSubject<RenameFileResponse>>(undefined);

  pathToFilmstripJpg: string;
  pathToVideoFile: string;
  percentOffset = 0;
  starRatingHack: StarRating;
  thumbnailsToDisplay = 4;

  constructor(
    public filePathService: FilePathService,
    public imageElementService: ImageElementService,
    public manualTagsService: ManualTagsService,
    public sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.pathToFilmstripJpg = this.filePathService.createFilePath(this.folderPath(), this.hubName(), 'filmstrips', this.video().hash);
    this.pathToVideoFile = path.join(this.selectedSourceFolder(), this.video().partialPath, this.video().fileName);
    this.percentOffset = (100 / (this.video().screens - 1));
    this.starRatingHack = this.star();
  }

  decreaseZoomLevel() {
    if (this.thumbnailsToDisplay > 1) {
      this.thumbnailsToDisplay++;
    }
  }

  resetZoomLevel() {
    this.thumbnailsToDisplay = 4;
  }

  increaseZoomLevel() {
    if (this.thumbnailsToDisplay < 10) {
      this.thumbnailsToDisplay--;
    }
  }

  addThisTag(tag: string) {
    const video = this.video();
    if (video.tags && video.tags.includes(tag)) {
      // console.log('TAG ALREADY ADDED!');
    } else {
      this.manualTagsService.addTag(tag);

      this.imageElementService.HandleEmission({
        index: video.index,
        tag: tag,
        type: 'add'
      });
    }
  }

  removeThisTag(tag: string) {
    this.manualTagsService.removeTag(tag);

    this.imageElementService.HandleEmission({
      index: this.video().index,
      tag: tag,
      type: 'remove'
    });
  }

  setStarRating(rating: StarRating): void {
    if (this.starRatingHack === rating) {
      rating = 0.5; // reset to "N/A" (not rated)
    }
    this.starRatingHack = rating; // hack for getting star opacity updated instantly
    this.imageElementService.HandleEmission({
      index: this.video().index,
      stars: rating
    });
  }

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.pathToVideoFile);
  }

  /**
   * Set ImageElement defaultScreen property
   */
  setDefaultScreenshot(event: any, index: number): void {
    event.stopPropagation();

    this.imageElementService.HandleEmission({
      index: this.video().index,
      defaultScreen: this.video().defaultScreen === index ? undefined : index
    });
  }

}
