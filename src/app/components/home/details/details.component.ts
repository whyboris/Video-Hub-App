import { Component, Input, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { ManualTagsService } from '../manual-tags/manual-tags.service';
import { Tag, TagsService } from '../tags/tags.service';

import { StarRating, ImageElement } from '../../common/final-object.interface';

import { galleryItemAppear } from '../../common/animations';

export interface TagEmission {
  id: string;
  tag: string;
  type: 'add' | 'remove';
}

export interface StarEmission {
  id: string;
  stars: StarRating;
}

@Component({
  selector: 'app-details-item',
  templateUrl: './details.component.html',
  styleUrls: [ './details.component.scss' ],
  animations: [ galleryItemAppear ]
})
export class DetailsComponent implements OnInit {

  @ViewChild('filmstripHolder') filmstripHolder: ElementRef;

  @Output() editFinalArrayStars = new EventEmitter<StarEmission>();
  @Output() editFinalArrayTag = new EventEmitter<TagEmission>();
  @Output() openFileRequest = new EventEmitter<string>();
  @Output() filterTag = new EventEmitter<object>();

  @Input() video: ImageElement;

  @Input() darkMode: boolean;
  @Input() elHeight: number;
  @Input() elWidth: number;
  @Input() folderPath: string;
  @Input() hoverScrub: boolean;
  @Input() hubName: string;
  @Input() imgHeight: number;
  @Input() imgId: any; // the filename of screenshot strip without `.jpg`
  @Input() largerFont: boolean;
  @Input() randomImage: boolean; // all code related to this currently removed
  @Input() returnToFirstScreenshot: boolean;
  @Input() showMeta: boolean;
  @Input() star: StarRating;
  @Input() showManualTags: boolean;
  @Input() showAutoFileTags: boolean;
  @Input() showAutoFolderTags: boolean;

  percentOffset: number = 0;
  firstFilePath = '';
  fullFilePath = '';
  hover: boolean;
  starRatingHack: StarRating;

  constructor(
    public manualTagsService: ManualTagsService,
    public tagsService: TagsService,
    public sanitizer: DomSanitizer
  ) { }

  mouseEnter() {
    if (this.hoverScrub) {
      this.hover = true;
    }
  }

  mouseLeave() {
    if (this.hoverScrub && this.returnToFirstScreenshot) {
      this.hover = false;
      this.percentOffset = 0;
    }
  }

  mouseClick() {
    this.openFileRequest.emit(this.imgId);
  }

  ngOnInit() {
    this.firstFilePath = 'file://' + this.folderPath + '/' + 'vha-' + this.hubName + '/thumbnails/' + this.imgId + '.jpg';
    this.fullFilePath =  'file://' + this.folderPath + '/' + 'vha-' + this.hubName + '/filmstrips/' + this.imgId + '.jpg';
    this.starRatingHack = this.star;
  }

  mouseIsMoving($event) {
    if (this.hoverScrub) {
      const cursorX = $event.layerX;
      const containerWidth = this.filmstripHolder.nativeElement.getBoundingClientRect().width;

      this.percentOffset = (100 / (this.video.screens - 1)) * Math.floor(cursorX / (containerWidth / this.video.screens));
    }
  }

  addThisTag(tag: string) {
    if (this.video.tags && this.video.tags.includes(tag)) {
      console.log('TAG ALREADY ADDED!');
    } else {
      this.manualTagsService.addTag(tag);

      this.editFinalArrayTag.emit({
        id: this.imgId,
        tag: tag,
        type: 'add'
      });
    }
  }

  filterThisTag(event: object) {
    this.filterTag.emit(event);
  }

  removeThisTag(tag: string) {
    this.manualTagsService.removeTag(tag);

    this.editFinalArrayTag.emit({
      id: this.imgId,
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
      id: this.imgId,
      stars: rating
    });
  }

}
