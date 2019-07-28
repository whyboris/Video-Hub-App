import { Component, Input } from '@angular/core';

import { galleryItemAppear, metaAppear } from '../../common/animations';
import { ImageElement } from '../../common/final-object.interface';

@Component({
  selector: 'app-file-item',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss',
              '../../fonts/icons.scss'],
  animations: [ galleryItemAppear,
                metaAppear ]
})
export class FileComponent {

  @Input() video: ImageElement;

  @Input() darkMode: boolean;
  @Input() largerFont: boolean;
  @Input() showMeta: boolean;

  constructor() { }

}
