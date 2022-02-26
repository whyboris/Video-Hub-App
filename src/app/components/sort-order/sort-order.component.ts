import { Component, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';

import { SortType } from '../../pipes/sorting.pipe';
import { filterItemAppear } from '../../common/animations';
import { SettingsButtonsType } from '../../common/settings-buttons';

@Component({
  selector: 'app-sort-order',
  templateUrl: './sort-order.component.html',
  styleUrls: [
    '../settings.scss',
    './sort-order.component.scss'
  ],
  animations: [filterItemAppear]
})
export class SortOrderComponent {

  @ViewChild('sortFilterElement', { static: false }) sortFilterElement: ElementRef;

  @Output() sortTypeChange = new EventEmitter<SortType>();

  @Input() settingsButtons: SettingsButtonsType;

  constructor() { }

}
