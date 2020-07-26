import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SettingsButtonsType } from '../../common/settings-buttons';

@Component({
  selector: 'app-rename-modal',
  templateUrl: './rename-modal.component.html',
  styleUrls: [
    '../buttons.scss',  // only for `close-modal-icon` class
    '../settings.scss', // only for `close-settings` class
    './rename-modal.component.scss'
  ]
})
export class RenameModalComponent {

  @Output() closeRename = new EventEmitter<any>();

  @Input() appState;
  @Input() macVersion;
  @Input() settingsButtons: SettingsButtonsType;
  @Input() itemToRename;
  @Input() currentRightClickedItem;
  @Input() renamingNow;

  constructor() { }

}
