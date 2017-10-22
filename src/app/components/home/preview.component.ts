import { Component, HostListener, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-gallery-item',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {

  @Input() stuff: any;
  @Input() folderPath: string;

  hover: boolean;
  initialPhoto = '';
  photo: string;
  timer: any;

  constructor(public sanitizer: DomSanitizer) { }

  @HostListener('mouseenter') onMouseEnter() {
    this.hover = true;
  }
  @HostListener('mouseleave') onMouseLeave() {
    this.hover = false;
  }

  ngOnInit() {

    // hack -- populate hardcoded values - fix later
    const fileNumber = this.stuff;
    this.stuff = [];
    this.stuff[0] = 'boris/' + fileNumber + '-1.jpg';
    this.stuff[1] = 'boris/' + fileNumber + '-2.jpg';
    this.stuff[2] = 'boris/' + fileNumber + '-3.jpg';
    this.stuff[3] = 'boris/' + fileNumber + '-4.jpg';
    this.stuff[4] = 'boris/' + fileNumber + '-5.jpg';

    console.log(this.folderPath);
    // Loads up the initial photo and shows it as main photo
    if (this.stuff) {
      this.initialPhoto = this.stuff[0];
    }
    this.photo = this.initialPhoto;
  }

  /**
   * Starts showing preview using a time interval
   */
  public startCycle() {
    console.log('hi');
    this.photo = this.initialPhoto;
    let current = 1;
    this.timer = setInterval(() => {
      console.log('hi2');
      this.photo = this.stuff[current];
      current++;
      if (current >= this.stuff.length) {
        current = 0;
      }
    }, 500);
  }

  /**
   * Stops preview clearing the interval
   */
  public stopCycle() {
    this.photo = this.initialPhoto;
    clearInterval(this.timer);
  }

}
