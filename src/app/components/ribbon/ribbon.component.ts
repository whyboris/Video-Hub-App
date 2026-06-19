import { Component, Input, input, output } from '@angular/core';
import { buttonAnimation } from '../../common/animations';
import type { SettingsButtonsType, SettingsButtonKey } from '../../common/settings-buttons';

@Component({
  standalone: false,
  selector: 'app-ribbon',
  templateUrl: './ribbon.component.html',
  styleUrls: [
    '../buttons.scss',
    './ribbon.component.scss'
  ],
  animations: [buttonAnimation]
})
export class RibbonComponent {

  readonly toggleButton = output<string>();

  readonly appState = input(undefined);
  @Input() settingsButtons: SettingsButtonsType;
  readonly settingsButtonsGroups = input<SettingsButtonKey[][]>();

  constructor() { }

}
