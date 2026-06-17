import { Component, Output, EventEmitter, input } from '@angular/core';
import type { SettingsButtonsType } from '../../common/settings-buttons';

@Component({
  standalone: false,
  selector: 'app-title-bar',
  templateUrl: './title-bar.component.html',
  styleUrls: ['./title-bar.component.scss']
})
export class TitleBarComponent {

  @Output() initiateClose = new EventEmitter<any>();
  @Output() initiateMaximize = new EventEmitter<any>();
  @Output() initiateMinimize = new EventEmitter<any>();

  readonly appState = input(undefined);
  readonly demo = input<boolean>(undefined);
  readonly importStage = input(undefined);
  readonly macVersion = input<boolean>(undefined);
  readonly progressString = input(undefined);
  readonly settingsButtons = input<SettingsButtonsType>(undefined);

  constructor() { }

}
