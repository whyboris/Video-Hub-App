import type { OnInit, ElementRef} from '@angular/core';
import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

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
  selector: 'app-thumbnail-sheet',
  templateUrl: './sheet.component.html',
  styleUrls: [ './../buttons.scss',
               './../views/time-and-rez.scss',
               './sheet.component.scss' ],
  animations: [ modalAnimation, textAppear, metaAppear ]
})
export class SheetComponent implements OnInit {

  @ViewChild('filmstripHolder', {static: false}) filmstripHolder: ElementRef;
  @ViewChild('thumbHolder', {static: false}) thumbHolder: ElementRef;

  @Output() filterTag = new EventEmitter<TagEmit>();
  @Output() openVideoAtTime = new EventEmitter<object>();

  @Input() video: ImageElement;

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
  @Input() star: StarRating;

  @Input() renameResponse: BehaviorSubject<RenameFileResponse>;

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
    this.pathToFilmstripJpg = this.filePathService.createFilePath(this.folderPath, this.hubName, 'filmstrips', this.video.hash);
    this.pathToVideoFile = path.join(this.selectedSourceFolder, this.video.partialPath, this.video.fileName);
    this.percentOffset = (100 / (this.video.screens - 1));
    this.starRatingHack = this.star;
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
    if (this.video.tags && this.video.tags.includes(tag)) {
      // console.log('TAG ALREADY ADDED!');
    } else {
      this.manualTagsService.addTag(tag);

      this.imageElementService.HandleEmission({
        index: this.video.index,
        tag: tag,
        type: 'add'
      });
    }
  }

  removeThisTag(tag: string) {
    this.manualTagsService.removeTag(tag);

    this.imageElementService.HandleEmission({
      index: this.video.index,
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
      index: this.video.index,
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
      index: this.video.index,
      defaultScreen: this.video.defaultScreen === index ? undefined : index
    });
  }

}
