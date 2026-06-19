import { Component, Input, input, output } from '@angular/core';
import type { SettingsButtonsType } from '../../common/settings-buttons';

@Component({
  standalone: false,
  selector: 'app-recently-opened-hubs',
  templateUrl: './recently-opened.component.html',
  styleUrls: ['./recently-opened.component.scss']
})
export class RecentlyOpenedComponent {

  readonly openFromHistory = output<number>();

  @Input() settingsButtons: SettingsButtonsType;
  readonly vhaFileHistory = input(undefined);

  constructor() { }

}
