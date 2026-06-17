import { Component, Output, EventEmitter, input } from '@angular/core';
import type { SettingsButtonsType } from '../../common/settings-buttons';

@Component({
  standalone: false,
  selector: 'app-resolution-filter',
  templateUrl: './resolution-filter.component.html',
  styleUrls: ['../resolution.scss']
})
export class ResolutionFilterComponent {

  @Output() newResFilterSelected = new EventEmitter<any>();

  readonly freqLeftBound = input(undefined);
  readonly freqRightBound = input(undefined);
  readonly resolutionFreqArr = input(undefined);
  readonly resolutionNames = input(undefined);
  readonly settingsButtons = input<SettingsButtonsType>(undefined);

  constructor() { }

}
