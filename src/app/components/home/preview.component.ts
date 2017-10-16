import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-gallery-item',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {

  @Input() stuff: any;
  @Input() folderPath: string;

  initialPhoto = '';
  photo: string;
  timer: any;

  constructor(public sanitizer: DomSanitizer) { }

  ngOnInit() {
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
    this.photo = this.initialPhoto;
    let current = 1;
    this.timer = setInterval(() => {
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
