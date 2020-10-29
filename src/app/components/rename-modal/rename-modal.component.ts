import { Component, Input, Output, EventEmitter } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { AppStateInterface } from '../../common/app-state';
import { ImageElement } from '../../../../interfaces/final-object.interface';
import { RenameFileResponse, RenameFolderResponse } from '../../../../interfaces/shared-interfaces';
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

  @Input() appState: AppStateInterface;
  @Input() basePath: string;
  @Input() currentRightClickedItem: ImageElement;
  @Input() macVersion: boolean;
  @Input() settingsButtons: SettingsButtonsType;

  @Input() renameResponse: BehaviorSubject<RenameFileResponse>;
  @Input() renameFolderResponse: BehaviorSubject<RenameFolderResponse>;

  constructor() { }

}
