import { Component, Input, HostListener } from '@angular/core';

import { galleryItemAppear, metaAppear } from '../../common/animations';

@Component({
  selector: 'app-file-item',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss',
              '../fonts/icons.scss'],
  animations: [ galleryItemAppear,
                metaAppear ]
})
export class FileComponent {

  @Input() elHeight: number;
  @Input() folderPath: string;
  @Input() rez: string;
  @Input() showMeta: boolean;
  @Input() imgId: any;
  @Input() time: string;
  @Input() title: string;
  @Input() largerFont: boolean;

  constructor() { }

}
