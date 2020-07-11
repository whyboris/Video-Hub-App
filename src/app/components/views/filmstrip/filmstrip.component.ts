import { Component, Input, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { FilePathService } from '../file-path.service';

import { metaAppear, textAppear } from '../../../common/animations';

import { ImageElement } from '../../../../../interfaces/final-object.interface';
import { RightClickEmit, VideoClickEmit, VideoClickSimilarEmit } from '../../../../../interfaces/shared-interfaces';

@Component({
  selector: 'app-filmstrip-item',
  templateUrl: './filmstrip.component.html',
  styleUrls: [
      '../film-and-full.scss',
      '../time-and-rez.scss',
      '../selected.scss'
    ],
  animations: [ textAppear,
                metaAppear ]
})
export class FilmstripComponent implements OnInit {

  @ViewChild('filmstripHolder', { static: false }) filmstripHolder: ElementRef;

  @Output() videoClick = new EventEmitter<VideoClickEmit>();
  @Output() rightClick = new EventEmitter<RightClickEmit>();
  @Output() videoClickSimilar = new EventEmitter<VideoClickSimilarEmit>();


  @Input() video: ImageElement;

  @Input() darkMode: boolean;
  @Input() elHeight: number;
  @Input() folderPath: string;
  @Input() hoverScrub: boolean;
  @Input() hubName: string;
  @Input() imgHeight: number;
  @Input() largerFont: boolean;
  @Input() showMeta: boolean;

  fullFilePath: string = '';
  filmXoffset: number = 0;

  constructor(
    public filePathService: FilePathService,
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.fullFilePath = this.filePathService.createFilePath(this.folderPath, this.hubName, 'filmstrips', this.video.hash);
  }

  updateFilmXoffset($event) {
    if (this.hoverScrub) {
      const imgWidth = this.imgHeight * (16 / 9); // hardcoded aspect ratio
      const containerWidth = this.filmstripHolder.nativeElement.getBoundingClientRect().width;
      const howManyScreensOutsideCutoff = this.video.screens - Math.floor(containerWidth / imgWidth);

      const cursorX = $event.layerX; // cursor's X position inside the filmstrip element
      this.filmXoffset = imgWidth * Math.floor(cursorX / (containerWidth / howManyScreensOutsideCutoff));
    }
  }
}
