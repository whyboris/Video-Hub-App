import { Component, Input, Output, EventEmitter } from '@angular/core';
import type { SettingsButtonsType } from '../../common/settings-buttons';

@Component({
  standalone: false,
  selector: 'app-star-filter',
  templateUrl: './star-filter.component.html',
  styleUrls: ['../resolution.scss']
})
export class StarFilterComponent {

  @Output() newStarFilterSelected = new EventEmitter<any>();

  @Input() settingsButtons: SettingsButtonsType;
  @Input() starLeftBound: number;
  @Input() starRatingFreqArr: number[];
  @Input() starRatingNames: string[];
  @Input() starRightBound: number;

  constructor() { }

}
