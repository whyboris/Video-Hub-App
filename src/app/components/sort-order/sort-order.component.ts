import type { ElementRef} from '@angular/core';
import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';

import type { SortType } from '@pipes';
import type { SettingsButtonsType } from '../../common/settings-buttons';

import { filterItemAppear } from '../../common/animations';

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
