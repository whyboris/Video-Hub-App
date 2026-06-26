import { Component, input, output } from '@angular/core';
import type { SettingsButtonsType } from '../../common/settings-buttons';

@Component({
  standalone: false,
  selector: 'app-resolution-filter',
  templateUrl: './resolution-filter.component.html',
  styleUrls: ['../resolution.scss']
})
export class ResolutionFilterComponent {

  readonly newResFilterSelected = output<any>();

  readonly freqLeftBound = input();
  readonly freqRightBound = input();
  readonly resolutionFreqArr = input();
  readonly resolutionNames = input();
  readonly settingsButtons = input<SettingsButtonsType>();

  constructor() { }

}
