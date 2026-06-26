import { Component, input, output } from '@angular/core';
import type { SettingsButtonsType } from '../../common/settings-buttons';

@Component({
  standalone: false,
  selector: 'app-title-bar',
  templateUrl: './title-bar.component.html',
  styleUrls: ['./title-bar.component.scss']
})
export class TitleBarComponent {

  readonly initiateClose = output<void>();
  readonly initiateMaximize = output<void>();
  readonly initiateMinimize = output<void>();

  readonly appState = input();
  readonly demo = input<boolean>();
  readonly importStage = input();
  readonly macVersion = input<boolean>();
  readonly progressString = input();
  readonly settingsButtons = input<SettingsButtonsType>();

  constructor() { }

}
