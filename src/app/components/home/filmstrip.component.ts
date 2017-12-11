import { Component, Input, OnInit, HostListener } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-filmstrip-item',
  templateUrl: './filmstrip.component.html',
  styleUrls: ['./filmstrip.component.scss']
})
export class FilmstripComponent implements OnInit {

  @Input() folderPath: string;
  @Input() hoverScrub: boolean;
  @Input() imgHeight: number;
  @Input() stuff: any;
  @Input() width: number;

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
    // this.stuff is `undefined` when no screenshot taken -- because of ffmpeg extraction error
    if (this.stuff === undefined) {
      this.noError = false;
    }

    // hack -- populate hardcoded values -- fix later
    const fileNumber = this.stuff;
    this.stuff = [];

    for (let i = 0; i < 10; i++) {
      this.stuff[i] = 'boris/' + fileNumber + '-' + (i + 1) + '.jpg';
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
