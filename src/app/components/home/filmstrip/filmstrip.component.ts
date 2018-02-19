import { Component, Input, OnInit, HostListener } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { galleryItemAppear, metaAppear, textAppear } from '../../common/animations';

@Component({
  selector: 'app-filmstrip-item',
  templateUrl: './filmstrip.component.html',
  styleUrls: ['./filmstrip.component.scss'],
  animations: [ galleryItemAppear,
                textAppear,
                metaAppear ]
})
export class FilmstripComponent implements OnInit {

  @Input() darkMode: boolean;
  @Input() elHeight: number;
  @Input() fileSize: number;
  @Input() folderPath: string;
  @Input() hoverScrub: boolean;
  @Input() hubName: string;
  @Input() imgHeight: number;
  @Input() imgId: any;
  @Input() imgWidth: number;
  @Input() largerFont: boolean;
  @Input() rez: string;
  @Input() showMeta: boolean;
  @Input() time: string;
  @Input() title: string;

  indexArray: Array<number> = []; // to set z-index on css

  hover = false;
  noError = true;

  constructor(
    public sanitizer: DomSanitizer
  ) { }

  @HostListener('mouseenter') onMouseEnter() {
    this.hover = true;
  }
  @HostListener('mouseleave') onMouseLeave() {
    this.hover = false;
  }

  ngOnInit() {
    // this.imgId is `undefined` when no screenshot taken -- because of ffmpeg extraction error
    if (this.imgId === undefined) {
      this.noError = false;
    }

    // hack -- populate hardcoded values -- fix later
    const fileNumber = this.imgId;
    this.imgId = [];

    for (let i = 0; i < 10; i++) {
      this.imgId[i] = 'vha-' + this.hubName + '/' + fileNumber + '-' + (i + 1) + '.jpg';
      this.indexArray[i] = 10 - i;
    }
  }

  showThisOne(screen: number): void {
    this.indexArray.forEach((element, index) => {
      const distance = Math.abs(index - screen);
      this.indexArray[index] = 10 - distance;
    });
  }

}
