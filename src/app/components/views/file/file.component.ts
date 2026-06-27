import { Component, Input, input } from '@angular/core';

import type { ImageElement } from '../../../../../interfaces/final-object.interface';
import { ImageElementService } from './../../../services/image-element.service';

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

  readonly darkMode = input<boolean>();
  readonly largerFont = input<boolean>();
  readonly showMeta = input<boolean>();
  readonly showFavorites = input<boolean>();

  constructor(
    public imageElementService: ImageElementService,
  ) { }

  toggleHeart(mouseClick: PointerEvent): void {
    mouseClick.stopPropagation();
    this.imageElementService.toggleHeart(this.video.index);
  }

}
