import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent {

  variable = [
    './assets/5.jpeg',
    './assets/4.jpeg',
    './assets/3.jpeg',
    './assets/2.jpeg',
    './assets/1.jpeg'
  ];

  variable2 = [
    './assets/4.jpeg',
    './assets/2.jpeg',
    './assets/5.jpeg',
    './assets/3.jpeg',
    './assets/1.jpeg'
  ];

  variable3 = [
    './assets/1.jpeg',
    './assets/4.jpeg',
    './assets/5.jpeg',
    './assets/2.jpeg',
    './assets/3.jpeg'
  ];

}
