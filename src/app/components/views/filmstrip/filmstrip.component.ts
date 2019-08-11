import { Component, Input, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { metaAppear, textAppear } from '../../../common/animations';
import { ImageElement } from '../../../common/final-object.interface';

@Component({
  selector: 'app-filmstrip-item',
  templateUrl: './filmstrip.component.html',
  styleUrls: ['../film-and-full.scss',
              '../time-and-rez.scss' ],
  animations: [ textAppear,
                metaAppear ]
})
export class FilmstripComponent implements OnInit {

  @ViewChild('filmstripHolder', { static: false }) filmstripHolder: ElementRef;

  @Output() videoClick = new EventEmitter<object>();
  @Output() rightClick = new EventEmitter<object>();

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
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.fullFilePath =  'file://' + this.folderPath + '/' + 'vha-' + this.hubName + '/filmstrips/' + this.video.hash + '.jpg';
  }

  updateFilmXoffset($event) {
    if (this.hoverScrub) {
      const imgWidth = this.imgHeight * (16 / 9); // hardcoded aspect ratio
      const containerWidth = this.filmstripHolder.nativeElement.getBoundingClientRect().width;
      const howManyScreensOutsideCutoff = (this.video.screens + 1) - Math.floor(containerWidth / imgWidth);

      const cursorX = $event.layerX; // cursor's X position inside the filmstrip element
      this.filmXoffset = imgWidth * Math.floor(cursorX / (containerWidth / howManyScreensOutsideCutoff));
    }
  }
}
