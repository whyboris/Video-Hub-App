import { Component, Input, EventEmitter, Output } from '@angular/core';

import { ImageElementService } from './../../services/image-element.service';
import { SourceFolderService } from '../statistics/source-folder.service';

import { RightClickEmit } from '../../../../interfaces/shared-interfaces';
import { SettingsButtonsType } from '../../common/settings-buttons';
import { modalAnimation, similarResultsText } from '../../common/animations';

@Component({
  selector: 'app-similar-tray',
  templateUrl: './similar-tray.component.html',
  styleUrls: [
    '../layout.scss',
    '../buttons.scss',
    './similar-tray.component.scss'
  ],
  animations: [modalAnimation, similarResultsText]
})
export class SimilarTrayComponent {

  @Output() handleClick = new EventEmitter<any>(); // todo: fix up the vague type
  @Output() rightMouseClicked = new EventEmitter<RightClickEmit>();

  @Input() appState;
  @Input() currentClickedItemName;
  @Input() previewHeightRelated;
  @Input() previewWidthRelated;
  @Input() settingsButtons: SettingsButtonsType;

  constructor(
    public imageElementService: ImageElementService,
    public sourceFolderService: SourceFolderService,
  ) { }

}
