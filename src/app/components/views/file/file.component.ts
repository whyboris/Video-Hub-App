import { Component, Input, input } from '@angular/core';

import { ImageElementService } from './../../../services/image-element.service';

import type { ImageElement } from '@my/final-object.interface';

@Component({
  standalone: false,
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

  readonly darkMode = input<boolean>(undefined);
  readonly largerFont = input<boolean>(undefined);
  readonly showMeta = input<boolean>(undefined);
  readonly showFavorites = input<boolean>(undefined);

  constructor(
    public imageElementService: ImageElementService,
  ) { }

  toggleHeart(): void {
    this.imageElementService.toggleHeart(this.video.index);
    event.stopPropagation();
  }

}
