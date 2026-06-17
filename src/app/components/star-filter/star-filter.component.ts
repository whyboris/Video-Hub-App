import { Component, Output, EventEmitter, input } from '@angular/core';
import type { SettingsButtonsType } from '../../common/settings-buttons';

@Component({
  standalone: false,
  selector: 'app-star-filter',
  templateUrl: './star-filter.component.html',
  styleUrls: ['../resolution.scss']
})
export class StarFilterComponent {

  @Output() newStarFilterSelected = new EventEmitter<any>();

  readonly settingsButtons = input<SettingsButtonsType>(undefined);
  readonly starLeftBound = input<number>(undefined);
  readonly starRatingFreqArr = input<number[]>(undefined);
  readonly starRatingNames = input<string[]>(undefined);
  readonly starRightBound = input<number>(undefined);

  constructor() { }

}
