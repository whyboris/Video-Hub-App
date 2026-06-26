import { Component, input, output } from '@angular/core';
import type { SettingsButtonsType } from '../../common/settings-buttons';

@Component({
  standalone: false,
  selector: 'app-star-filter',
  templateUrl: './star-filter.component.html',
  styleUrls: ['../resolution.scss']
})
export class StarFilterComponent {

  readonly newStarFilterSelected = output<any>();

  readonly settingsButtons = input<SettingsButtonsType>();
  readonly starLeftBound = input<number>();
  readonly starRatingFreqArr = input<number[]>();
  readonly starRatingNames = input<string[]>();
  readonly starRightBound = input<number>();

  constructor() { }

}
