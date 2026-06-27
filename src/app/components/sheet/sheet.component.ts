import type { OnInit } from '@angular/core';
import { Component, input, output } from '@angular/core';

import * as path from 'path';
import type { BehaviorSubject } from 'rxjs';

import { FilePathService } from '../views/file-path.service';
import { ImageElementService } from './../../services/image-element.service';
import { ManualTagsService } from '../tags-manual/manual-tags.service';

import type { StarRating, ImageElement } from '../../../../interfaces/final-object.interface';
import type { TagEmit, RenameFileResponse } from '../../../../interfaces/shared-interfaces';

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

  readonly filterTag = output<TagEmit>();
  readonly openVideoAtTime = output<object>();

  readonly video = input<ImageElement>();

  readonly darkMode = input<boolean>();
  readonly elHeight = input<number>();
  readonly elWidth = input<number>();
  readonly folderPath = input<string>();
  readonly hoverScrub = input<boolean>();
  readonly hubName = input<string>();
  readonly imgHeight = input<number>();
  readonly largerFont = input<boolean>();
  readonly returnToFirstScreenshot = input<boolean>();
  readonly selectedSourceFolder = input<string>();
  readonly showAutoFileTags = input<boolean>();
  readonly showAutoFolderTags = input<boolean>();
  readonly showManualTags = input<boolean>();
  readonly showMeta = input<boolean>();
  readonly showVideoNotes = input<boolean>();
  readonly star = input<StarRating>();

  readonly renameResponse = input<BehaviorSubject<RenameFileResponse>>();

  pathToFilmstripJpg: string;
  pathToVideoFile: string;
  percentOffset = 0;
  starRatingHack: StarRating;
  thumbnailsToDisplay = 4;

  arrayHack: number[] = [];

  constructor(
    public filePathService: FilePathService,
    public imageElementService: ImageElementService,
    public manualTagsService: ManualTagsService
  ) { }

  ngOnInit() {

    // creates e.g. [0, 1, 2, 3] when .screens == 4
    // useful so that @for has something to `track`
    this.arrayHack = Array.from({ length: this.video().screens }, (_, index) => index);

    this.pathToFilmstripJpg = this.filePathService.createFilePath(this.folderPath(), this.hubName(), 'filmstrips', this.video().hash);
    this.pathToVideoFile = path.join(this.selectedSourceFolder(), this.video().partialPath, this.video().fileName);
    this.percentOffset = (100 / this.video().screens);
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
  setDefaultScreenshot(event: PointerEvent, index: number): void {
    event.stopPropagation();

    this.imageElementService.HandleEmission({
      index: this.video().index,
      defaultScreen: this.video().defaultScreen === index ? undefined : index
    });
  }

}
