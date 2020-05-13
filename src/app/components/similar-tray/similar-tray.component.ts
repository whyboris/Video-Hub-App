import { Component, Input, EventEmitter, Output } from '@angular/core';
import { modalAnimation, similarResultsText } from '../../common/animations';
import { RightClickEmit } from '../../../../interfaces/shared-interfaces';

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
  @Input() currentPlayingFile;
  @Input() finalArray;
  @Input() previewHeightRelated;
  @Input() previewWidthRelated;
  @Input() settingsButtons;

  constructor() { }

}
