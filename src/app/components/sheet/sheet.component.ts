import { Component, Input, Output, OnInit, ElementRef, EventEmitter, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { ManualTagsService } from '../tags-manual/manual-tags.service';

import { StarRating, ImageElement } from '../common/final-object.interface';

import { galleryItemAppear, metaAppear, textAppear } from '../common/animations';
import { YearEmission } from '../views/details/details.component';

export interface TagEmission {
  index: number;
  tag: string;
  type: 'add' | 'remove';
}

export interface StarEmission {
  index: number;
  stars: StarRating;
}

@Component({
  selector: 'app-thumbnail-sheet',
  templateUrl: './sheet.component.html',
  styleUrls: [ './../buttons.scss',
               './sheet.component.scss' ],
  animations: [ galleryItemAppear,
                textAppear,
                metaAppear ]
})
export class SheetComponent implements OnInit {

  @ViewChild('filmstripHolder', {static: false}) filmstripHolder: ElementRef;
  @ViewChild('thumbHolder', {static: false}) thumbHolder: ElementRef;

  @Output() editFinalArrayStars = new EventEmitter<StarEmission>();
  @Output() editFinalArrayTag = new EventEmitter<TagEmission>();
  @Output() editFinalArrayYear = new EventEmitter<YearEmission>();
  @Output() filterTag = new EventEmitter<object>();
  @Output() openFileRequest = new EventEmitter<number>();

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
  @Input() showMeta: boolean;
  @Input() star: StarRating;
  @Input() showManualTags: boolean;
  @Input() showAutoFileTags: boolean;
  @Input() showAutoFolderTags: boolean;

  percentOffset: number = 0;
  fullFilePath = '';
  thumbnailsToDisplay = 4;
  starRatingHack: StarRating;

  constructor(
    public manualTagsService: ManualTagsService,
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.fullFilePath =  'file://' + this.folderPath + '/' + 'vha-' + this.hubName + '/filmstrips/' + this.video.hash + '.jpg';
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
      console.log('TAG ALREADY ADDED!');
    } else {
      this.manualTagsService.addTag(tag);

      this.editFinalArrayTag.emit({
        index: this.video.index,
        tag: tag,
        type: 'add'
      });
    }
  }

  removeThisTag(tag: string) {
    this.manualTagsService.removeTag(tag);

    this.editFinalArrayTag.emit({
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
    this.editFinalArrayStars.emit({
      index: this.video.index,
      stars: rating
    });
  }

}
