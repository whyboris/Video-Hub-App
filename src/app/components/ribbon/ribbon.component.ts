import { Component, Input, EventEmitter, Output } from '@angular/core';
import { buttonAnimation } from '../../common/animations';
import type { SettingsButtonsType } from '../../common/settings-buttons';

@Component({
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

  @Input() appState;
  @Input() settingsButtons: SettingsButtonsType;
  @Input() settingsButtonsGroups;

  constructor() { }

}
