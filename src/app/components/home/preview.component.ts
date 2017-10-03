import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-gallery-item',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {

  @Input() stuff: any;

  title = 'app';
  initialPhoto: string;
  photo: string;
  timer: any;

  ngOnInit() {
    this.initialPhoto = this.stuff[0];
    this.photo = this.initialPhoto;
    console.log('app-gallery-item is:');
    console.log(this.stuff);
  }

  public cycleImages() {
    console.log('hi');
    this.photo = this.initialPhoto;
    let current = 1;
    this.timer = setInterval(() => {
      this.photo = this.stuff[current];
      current++;
      if (current >= this.stuff.length) {
        current = 0;
      }
      console.log('tick: ' + current);
    }, 500);
  }

  public stopCycle() {
    console.log('bye');
    this.photo = this.initialPhoto;
    clearInterval(this.timer);
  }

}
