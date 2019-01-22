import { Component, Input } from '@angular/core';

import { galleryItemAppear, metaAppear } from '../../common/animations';
import { ImageElement } from '../../common/final-object.interface';

@Component({
  selector: 'app-folder-item',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss',
              '../fonts/icons.scss'],
  animations: [ galleryItemAppear,
                metaAppear ]
})
export class FolderComponent {

  @Input() video: ImageElement;

  @Input() darkMode: boolean;

  constructor() { }

}
