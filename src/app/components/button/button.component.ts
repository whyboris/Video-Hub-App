import { Component, input, output } from '@angular/core';

import type { SettingsButtonKey, SettingsButtonsType } from '../../common/settings-buttons';

@Component({
  standalone: false,
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: [
    '../buttons.scss',
    './button.component.scss'
  ]
})
export class ButtonComponent {

  readonly button = input<SettingsButtonKey>(undefined);
  readonly settingsButtons = input<SettingsButtonsType>(undefined);
  readonly neverDarkMode = input<boolean>(undefined);

  readonly toggleButton = output<string>();

  constructor() { }
}
