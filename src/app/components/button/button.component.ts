import { Component, EventEmitter, Input, Output } from '@angular/core';

import { SettingsButtonKey, SettingsButtonsType } from '../../common/settings-buttons';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: [
    '../buttons.scss',
    './button.component.scss'
  ]
})
export class ButtonComponent {

  @Input() button: SettingsButtonKey;
  @Input() settingsButtons: SettingsButtonsType;
  @Input() neverDarkMode: boolean;

  @Output() toggleButton = new EventEmitter<string>();

  constructor() { }
}
