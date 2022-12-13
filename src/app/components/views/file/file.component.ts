import { Component, Input } from '@angular/core';

import type { ImageElement } from '../../../../../interfaces/final-object.interface';
import { ImageElementService } from './../../../services/image-element.service';

@Component({
  selector: 'app-file-item',
  templateUrl: './file.component.html',
  styleUrls: [
      './file.component.scss',
      '../../../fonts/icons.scss',
      '../selected.scss'
    ]
})
export class FileComponent {

  @Input() video: ImageElement;

  @Input() darkMode: boolean;
  @Input() largerFont: boolean;
  @Input() showMeta: boolean;
  @Input() showFavorites: boolean;

  heartLitHack: boolean; // true if stars == 5.5, false otherwise

  constructor(
    public imageElementService: ImageElementService,
  ) { }

  ngOnInit() {
    this.heartLitHack = this.video.stars == 5.5;
  }

  toggleHeart(): void {
    console.log("Called toggleHeart()\n");
    console.log("Previous rating:");
    console.log(this.video.stars);
    if (this.video.stars == 5.5) { // "un-favorite" the video
      this.imageElementService.HandleEmission({
        index: this.video.index,
        stars: 0.5,
        favorite: false
      });
      this.heartLitHack = false;
    } else { // "favorite" the video
      this.imageElementService.HandleEmission({
        index: this.video.index,
        stars: 5.5,
        favorite: true
      });
      this.heartLitHack = true;
    }
    // stop event propagation (such as opening the video)
    event.stopImmediatePropagation();
    console.log("\nNow rating:");
    console.log(this.video.stars);
    console.log(this.video.favorite);
  }

}
