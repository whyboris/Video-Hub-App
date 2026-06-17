import { Component, Input, EventEmitter, Output, input } from '@angular/core';
import { buttonAnimation } from '../../common/animations';
import type { SettingsButtonsType } from '../../common/settings-buttons';

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

  @Output() toggleButton = new EventEmitter<string>();

  readonly appState = input(undefined);
  @Input() settingsButtons: SettingsButtonsType;
  readonly settingsButtonsGroups = input(undefined);

  constructor() { }

}
