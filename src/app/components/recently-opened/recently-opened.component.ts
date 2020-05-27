import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SettingsButtonsType } from '../../common/settings-buttons';

@Component({
  selector: 'app-recently-opened',
  templateUrl: './recently-opened.component.html',
  styleUrls: ['./recently-opened.component.scss']
})
export class RecentlyOpenedComponent {

  @Output() openFromHistory = new EventEmitter<number>();

  @Input() settingsButtons: SettingsButtonsType;
  @Input() vhaFileHistory;

  constructor() { }

}
