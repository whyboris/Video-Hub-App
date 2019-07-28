import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { ManualTagsService } from '../tags-manual/manual-tags.service';

import { StarRating, ImageElement } from '../../common/final-object.interface';
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
  selector: 'app-meta-item',
  templateUrl: './meta.component.html',
  styleUrls: [ './meta.component.scss' ]
})
export class MetaComponent implements OnInit {

  @ViewChild('yearInput', { static: false }) yearInput: ElementRef;

  @Output() editFinalArrayStars = new EventEmitter<StarEmission>();
  @Output() editFinalArrayTag = new EventEmitter<TagEmission>();
  @Output() editFinalArrayYear = new EventEmitter<YearEmission>();
  @Output() filterTag = new EventEmitter<object>();
  @Output() openFileRequest = new EventEmitter<number>();

  @Input() video: ImageElement;

  @Input() darkMode: boolean;
  @Input() imgHeight: number;
  @Input() largerFont: boolean;
  @Input() showMeta: boolean;
  @Input() star: StarRating;
  @Input() showManualTags: boolean;
  @Input() showAutoFileTags: boolean;
  @Input() showAutoFolderTags: boolean;
  @Input() maxWidth: number;

  starRatingHack: StarRating;
  yearHack: number;

  tagViewUpdateHack: boolean = false;

  constructor(
    private cd: ChangeDetectorRef,
    public manualTagsService: ManualTagsService,
    public sanitizer: DomSanitizer
  ) { }


  ngOnInit() {
    this.starRatingHack = this.star;
    this.yearHack = this.video.year;
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
    this.tagViewUpdateHack = !this.tagViewUpdateHack;
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
    this.tagViewUpdateHack = !this.tagViewUpdateHack;
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

  /**
   * Update the FinalArray with the year!
   * @param year
   */
  setYear(year: number): void {
    this.editFinalArrayYear.emit({
      index: this.video.index,
      year: year,
    });
  }

  /**
   * Prevent `e` and `.` input
   * @param event key press on the <input>
   */
  preventUnwantedKeypress(event: any): void {
    if (event.key === '.' || event.key === 'e') {
      event.preventDefault();
    }
  }

  /**
   * Validate the year and save it to model
   * @param event
   */
  validateYear(event: any): void {
    const currVal = event.target.valueAsNumber;

    if (currVal < 1800 || currVal > 3000) {
      this.yearHack = 2000;
      this.cd.detectChanges();
    } else {
      this.yearHack = currVal;
    }
    this.yearInput.nativeElement.blur();
    this.setYear(this.yearHack);
  }

  /**
   * Auto-fill the year if it's not present
   * @param event
   */
  autoFillYear($event: any) {
    if (!this.yearHack) {
      this.yearHack = 2000;
      this.setYear(2000);
      setTimeout(() => {
        this.yearInput.nativeElement.select();
      }, 1);
    }
  }

}
