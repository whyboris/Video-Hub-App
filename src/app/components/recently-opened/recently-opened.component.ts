import { Component, Input, Output, EventEmitter, input } from '@angular/core';
import type { SettingsButtonsType } from '../../common/settings-buttons';

@Component({
  standalone: false,
  selector: 'app-recently-opened-hubs',
  templateUrl: './recently-opened.component.html',
  styleUrls: ['./recently-opened.component.scss']
})
export class RecentlyOpenedComponent {

  @Output() openFromHistory = new EventEmitter<number>();

  @Input() settingsButtons: SettingsButtonsType;
  readonly vhaFileHistory = input(undefined);

  constructor() { }

}
