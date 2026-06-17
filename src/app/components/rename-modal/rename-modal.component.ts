import { Component, input, output } from '@angular/core';

import type { BehaviorSubject } from 'rxjs';

import type { AppStateInterface } from '../../common/app-state';
import type { ImageElement } from '../../../../interfaces/final-object.interface';
import type { RenameFileResponse } from '../../../../interfaces/shared-interfaces';
import type { SettingsButtonsType } from '../../common/settings-buttons';

@Component({
  standalone: false,
  selector: 'app-rename-modal',
  templateUrl: './rename-modal.component.html',
  styleUrls: [
    '../buttons.scss',  // only for `close-modal-icon` class
    '../settings.scss', // only for `close-settings` class
    './rename-modal.component.scss'
  ]
})
export class RenameModalComponent {

  readonly closeRename = output<any>();

  readonly appState = input<AppStateInterface>(undefined);
  readonly basePath = input<string>(undefined);
  readonly currentRightClickedItem = input<ImageElement>(undefined);
  readonly macVersion = input<boolean>(undefined);
  readonly settingsButtons = input<SettingsButtonsType>(undefined);

  readonly renameResponse = input<BehaviorSubject<RenameFileResponse>>(undefined);

  constructor() { }

}
