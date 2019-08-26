import { Component, Input } from '@angular/core';

import { ImageElement } from '../../../../../interfaces/final-object.interface';

@Component({
  selector: 'app-file-item',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss',
              '../../../fonts/icons.scss']
})
export class FileComponent {

  @Input() video: ImageElement;

  @Input() darkMode: boolean;
  @Input() largerFont: boolean;
  @Input() showMeta: boolean;

  constructor() { }

}
