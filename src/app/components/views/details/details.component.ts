import { Component, Input, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { ManualTagsService } from '../../tags-manual/manual-tags.service';
import { FilePathService } from '../file-path.service';

import { StarRating, ImageElement } from '../../../../../interfaces/final-object.interface';
import { TagEmission } from '../../../../../interfaces/shared-interfaces';

export interface StarEmission {
  index: number;
  stars: StarRating;
}

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

  @Output() editFinalArrayStars = new EventEmitter<StarEmission>();
  @Output() editFinalArrayTag = new EventEmitter<TagEmission>();
  @Output() editFinalArrayYear = new EventEmitter<YearEmission>();
  @Output() filterTag = new EventEmitter<object>();

  @Output() videoClick = new EventEmitter<object>();
  @Output() rightClick = new EventEmitter<object>();

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
  @Input() showMeta: boolean;
  @Input() star: StarRating;
  @Input() showManualTags: boolean;
  @Input() showAutoFileTags: boolean;
  @Input() showAutoFolderTags: boolean;

  percentOffset: number = 0;
  firstFilePath = '';
  fullFilePath = '';
  hover: boolean;

  constructor(
    public filePathService: FilePathService,
    public manualTagsService: ManualTagsService,
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

  ngOnInit() {
    this.firstFilePath = this.filePathService.createFilePath(this.folderPath, this.hubName, 'thumbnails', this.video.hash);
    this.fullFilePath =  this.filePathService.createFilePath(this.folderPath, this.hubName, 'filmstrips', this.video.hash);
  }

  mouseIsMoving($event) {
    if (this.hoverScrub) {
      const cursorX = $event.layerX;
      const containerWidth = this.filmstripHolder.nativeElement.getBoundingClientRect().width;

      this.percentOffset = (100 / (this.video.screens - 1)) * Math.floor(cursorX / (containerWidth / this.video.screens));
    }
  }
}
