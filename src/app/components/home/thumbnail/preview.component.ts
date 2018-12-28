import { Component, HostListener, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { galleryItemAppear, metaAppear, textAppear } from '../../common/animations';

@Component({
  selector: 'app-gallery-item',
  templateUrl: './preview.component.html',
  styleUrls: [ './preview.component.scss' ],
  animations: [ galleryItemAppear,
                textAppear,
                metaAppear ]
})
export class PreviewComponent implements OnInit {

  @ViewChild('filmstripHolder') filmstripHolder: ElementRef;

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
  @Input() randomImage: boolean; // all code related to this currently removed
  @Input() rez: string;
  @Input() showMeta: boolean;
  @Input() time: string;
  @Input() title: string;

  percentOffset: number = 0;
  firstFilePath = '';
  fullFilePath = '';
  hover: boolean;

  constructor(
    public sanitizer: DomSanitizer
  ) { }

  @HostListener('mouseenter') onMouseEnter() {
    if (this.hoverScrub) {
      this.hover = true;
    }
  }
  @HostListener('mouseleave') onMouseLeave() {
    if (this.hoverScrub) {
      this.hover = false;
      this.filmXoffset = 0;
    }
  }

  ngOnInit() {
    this.firstFilePath = 'file://' + this.folderPath + '/' + 'vha-' + this.hubName + '/' + this.imgId + '-first.jpg';
    this.fullFilePath =  'file://' + this.folderPath + '/' + 'vha-' + this.hubName + '/' + this.imgId + '.jpg';
  }

  mouseIsMoving($event) {
    if (this.hoverScrub) {
      const cursorX = $event.layerX;
      const containerWidth = this.filmstripHolder.nativeElement.getBoundingClientRect().width;

      // 10 is the number of screenshots
      // 9 is 1 less than that ;)
      this.percentOffset = (100 / 9) * Math.floor(cursorX / (containerWidth / 10));
    }
  }

}
