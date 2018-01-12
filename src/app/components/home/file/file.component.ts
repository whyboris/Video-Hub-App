import { Component, Input, OnInit, HostListener } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { galleryItemAppear } from '../../common/animations';

@Component({
  selector: 'app-file-item',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss',
              '../photon/icons.scss'],
  animations: [galleryItemAppear]
})
export class FileComponent implements OnInit {

  @Input() elHeight: number;
  @Input() elWidth: number;
  @Input() folderPath: string;
  @Input() hoverScrub: boolean;
  @Input() imgHeight: number;
  @Input() randomImage: boolean;
  @Input() rez: string;
  @Input() showMeta: boolean;
  @Input() imgId: any;
  @Input() time: string;
  @Input() title: string;
  @Input() showFolder: boolean;

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
      this.imgId[i] = 'boris/' + fileNumber + '-' + (i + 1) + '.jpg';
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
