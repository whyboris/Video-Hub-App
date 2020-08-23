import { Component, Input, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { BehaviorSubject } from 'rxjs';

import { ManualTagsService } from '../../tags-manual/manual-tags.service';
import { FilePathService } from '../file-path.service';

import { StarRating, ImageElement } from '../../../../../interfaces/final-object.interface';
import { VideoClickEmit, RightClickEmit, TagEmit, RenameFileResponse } from '../../../../../interfaces/shared-interfaces';

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
  @Input() star: StarRating;

  @Input() renameResponse: BehaviorSubject<RenameFileResponse>;

  containerWidth: number;
  firstFilePath = '';
  fullFilePath = '';
  hover: boolean;
  indexToShow: number = 1;
  percentOffset: number = 0;

  constructor(
    public filePathService: FilePathService,
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
      this.percentOffset = 0;
    }
  }

  ngOnInit() {
    this.firstFilePath = this.filePathService.createFilePath(this.folderPath, this.hubName, 'thumbnails', this.video.hash);
    this.fullFilePath =  this.filePathService.createFilePath(this.folderPath, this.hubName, 'filmstrips', this.video.hash);
  }

  mouseIsMoving($event) {
    if (this.hoverScrub) {
      const cursorX = $event.layerX;
      this.indexToShow = Math.floor(cursorX * (this.video.screens / this.containerWidth));
      this.percentOffset = this.indexToShow * (100 / (this.video.screens - 1));
    }
  }
}
