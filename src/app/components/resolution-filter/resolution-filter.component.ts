import { Component, input, output } from '@angular/core';

import type { SettingsButtonsType } from '../../common/settings-buttons';
import type { ResolutionString } from '../../../../interfaces/final-object.interface';

@Component({
  standalone: false,
  selector: 'app-resolution-filter',
  templateUrl: './resolution-filter.component.html',
  styleUrls: ['../resolution.scss']
})
export class ResolutionFilterComponent {

  readonly newResFilterSelected = output<any>();

  readonly freqLeftBound = input<number>();
  readonly freqRightBound = input<number>();
  readonly resolutionFreqArr = input<number[]>();
  readonly resolutionNames = input<ResolutionString[]>();
  readonly settingsButtons = input<SettingsButtonsType>();

  constructor() { }

}
