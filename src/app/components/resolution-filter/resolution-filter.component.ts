import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-resolution-filter',
  templateUrl: './resolution-filter.component.html',
  styleUrls: [
    '../resolution.scss',
    './resolution-filter.component.scss'
  ]
})
export class ResolutionFilterComponent {

  @Output() newResFilterSelected = new EventEmitter<any>();

  @Input() freqLeftBound;
  @Input() freqRightBound;
  @Input() resolutionFreqArr;
  @Input() resolutionNames;
  @Input() settingsButtons;

  constructor() { }

}
