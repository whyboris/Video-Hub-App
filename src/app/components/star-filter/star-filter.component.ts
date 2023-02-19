import { Component, Input, Output, EventEmitter } from '@angular/core';
import type { SettingsButtonsType } from '../../common/settings-buttons';

@Component({
  selector: 'app-star-filter',
  templateUrl: './star-filter.component.html',
  styleUrls: [
    '../resolution.scss',
    './star-filter.component.scss'
  ]
})
export class StarFilterComponent {

  @Output() newStarFilterSelected = new EventEmitter<any>();

  @Input() settingsButtons: SettingsButtonsType;
  @Input() starLeftBound;
  @Input() starRatingFreqArr;
  @Input() starRatingNames;
  @Input() starRightBound;

  constructor() { }

}
