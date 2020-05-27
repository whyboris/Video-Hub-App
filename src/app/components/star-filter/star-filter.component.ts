import { Component, Input, Output, EventEmitter } from '@angular/core';

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

  @Input() settingsButtons;
  @Input() starLeftBound;
  @Input() starRatingFreqArr;
  @Input() starRatingNames;
  @Input() starRightBound;

  constructor() { }

}
