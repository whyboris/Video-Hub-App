import { Component, Input, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { galleryItemAppear } from '../../common/animations';

import { ManualTags } from '../manual-tags/manual-tags.service';

export interface TagEmission {
  id: string;
  tag: string;
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
  @Output() addTagToFinalArray = new EventEmitter<TagEmission>();

  @Input() darkMode: boolean;
  @Input() elHeight: number;
  @Input() elWidth: number;
  @Input() fileSize: number;
  @Input() folderPath: string;
  @Input() hoverScrub: boolean;
  @Input() hubName: string;
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

  percentOffset: number = 0;
  firstFilePath = '';
  fullFilePath = '';
  hover: boolean;

  tempTags: string[] = ['one', 'two', 'three'];

  constructor(
    public tagService: ManualTags,
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
    if (this.tempTags.includes(tag)) {
      console.log('ALREADY ON THE LIST!');
    } else {
      this.tempTags.push(tag);
      // also notify the service!
      this.tagService.addTag(tag);

      // TODO: fix -- only emit if service returns succes !!!
      this.addTagToFinalArray.emit({
        id: this.imgId,
        tag: tag
      });
    }

  }

}
