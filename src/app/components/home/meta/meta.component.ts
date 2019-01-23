import { Component, Input, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { ManualTagsService } from '../manual-tags/manual-tags.service';
import { Tag, TagsService } from '../tags/tags.service';

import { StarRating, ImageElement } from '../../common/final-object.interface';

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
  selector: 'app-meta-item',
  templateUrl: './meta.component.html',
  styleUrls: [ './meta.component.scss' ]
})
export class MetaComponent implements OnInit {

  @Output() editFinalArrayStars = new EventEmitter<StarEmission>();
  @Output() editFinalArrayTag = new EventEmitter<TagEmission>();
  @Output() openFileRequest = new EventEmitter<number>();
  @Output() filterTag = new EventEmitter<object>();

  @Input() video: ImageElement;

  @Input() darkMode: boolean;
  @Input() imgHeight: number;
  @Input() largerFont: boolean;
  @Input() showMeta: boolean;
  @Input() star: StarRating;
  @Input() showManualTags: boolean;
  @Input() showAutoFileTags: boolean;
  @Input() showAutoFolderTags: boolean;

  starRatingHack: StarRating;

  constructor(
    public manualTagsService: ManualTagsService,
    public tagsService: TagsService,
    public sanitizer: DomSanitizer
  ) { }


  ngOnInit() {
    this.starRatingHack = this.star;
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

  filterThisTag(event: object) {
    this.filterTag.emit(event);
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
