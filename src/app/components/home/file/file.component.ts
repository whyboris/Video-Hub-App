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
  @Input() fileSize: number;
  @Input() folderPath: string;
  @Input() imgId: any;
  @Input() largerFont: boolean;
  @Input() rez: string;
  @Input() showMeta: boolean;
  @Input() time: string;
  @Input() title: string;
  @Input() darkMode: boolean;

  constructor() { }

}
