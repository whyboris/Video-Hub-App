import { Component, Input, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { galleryItemAppear } from '../../common/animations';

import { ManualTagsService } from '../manual-tags/manual-tags.service';

export interface TagEmission {
  id: string;
  tag: string;
  type: 'add' | 'remove';
}

export interface StarEmission {
  id: string;
  stars: number;
}

@Component({
  selector: 'app-details-item',
  templateUrl: './details.component.html',
  styleUrls: [ './details.component.scss' ],
  animations: [ galleryItemAppear ]
})
export class DetailsComponent implements OnInit {

  @ViewChild('filmstripHolder') filmstripHolder: ElementRef;

  @Output() openFileRequest = new EventEmitter<string>();
  @Output() editFinalArrayStars = new EventEmitter<StarEmission>();
  @Output() editFinalArrayTag = new EventEmitter<TagEmission>();

  @Input() darkMode: boolean;
  @Input() elHeight: number;
  @Input() elWidth: number;
  @Input() fileSize: number;
  @Input() folderPath: string;
  @Input() hoverScrub: boolean;
  @Input() hubName: string;
  @Input() tags: string[];
  @Input() imgHeight: number;
  @Input() imgId: any; // the filename of screenshot strip without `.jpg`
  @Input() largerFont: boolean;
  @Input() numOfScreenshots: number;
  @Input() randomImage: boolean; // all code related to this currently removed
  @Input() returnToFirstScreenshot: boolean;
  @Input() rez: string;
  @Input() showMeta: boolean;
  @Input() time: string;
  @Input() title: string;
  @Input() star: number; // star rating

  percentOffset: number = 0;
  firstFilePath = '';
  fullFilePath = '';
  hover: boolean;

  constructor(
    public tagService: ManualTagsService,
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
  }

  mouseIsMoving($event) {
    if (this.hoverScrub) {
      const cursorX = $event.layerX;
      const containerWidth = this.filmstripHolder.nativeElement.getBoundingClientRect().width;

      this.percentOffset = (100 / (this.numOfScreenshots - 1)) * Math.floor(cursorX / (containerWidth / this.numOfScreenshots));
    }
  }

  addThisTag(tag: string) {
    if (this.tags && this.tags.includes(tag)) {
      console.log('TAG ALREADY ADDED!');
    } else {
      this.tagService.addTag(tag);

      this.editFinalArrayTag.emit({
        id: this.imgId,
        tag: tag,
        type: 'add'
      });
    }
  }

  removeThisTag(tag: string) {
    this.tagService.removeTag(tag);

    this.editFinalArrayTag.emit({
      id: this.imgId,
      tag: tag,
      type: 'remove'
    });
  }

  setStarRating(rating: number): void {
    console.log(rating);
    this.editFinalArrayStars.emit({
      id: this.imgId,
      stars: rating
    });
  }

}
