import { Component, Input } from '@angular/core';

import { ImageElementService } from './../../../services/image-element.service';

import type { ImageElement } from '@my/final-object.interface';

@Component({
  selector: 'app-file-item',
  templateUrl: './file.component.html',
  styleUrls: [
      '../time-and-rez.scss',
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

  constructor(
    public imageElementService: ImageElementService,
  ) { }

  toggleHeart(): void {
    this.imageElementService.toggleHeart(this.video.index);
    event.stopPropagation();
  }

}
