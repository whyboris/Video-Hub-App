import { Component, Input, OnInit } from '@angular/core';

import type { ImageElement } from '../../../../../interfaces/final-object.interface';
import { ImageElementService } from './../../../services/image-element.service';
import { SettingsButton } from '../../../common/settings-buttons.interface';
import { SettingsButtonsType, SettingsButtons} from '../../../common/settings-buttons';
import { ContentObserver } from '@angular/cdk/observers';

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
export class FileComponent implements OnInit {

  @Input() video: ImageElement;

  @Input() darkMode: boolean;
  @Input() largerFont: boolean;
  @Input() showMeta: boolean;
  @Input() showFavorites: boolean;
  @Input() SettingsButton: SettingsButtonsType;

  settingsButtons = SettingsButtons;
  
  ngOnInit(){
    
  }

  constructor(
    public imageElementService: ImageElementService,
  ) { }

  toggleHeart(): void {
    this.imageElementService.toggleHeart(this.video.index);
    event.stopPropagation();
  }

}
