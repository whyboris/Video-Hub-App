import { Component, Input, Output, EventEmitter } from '@angular/core';

import type { BehaviorSubject } from 'rxjs';

import type { AppStateInterface } from '../../common/app-state';
import type { ImageElement } from '../../../../interfaces/final-object.interface';
import type { RenameFileResponse } from '../../../../interfaces/shared-interfaces';
import type { SettingsButtonsType } from '../../common/settings-buttons';

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

  constructor() { }

}
