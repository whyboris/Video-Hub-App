import type { ElementRef} from '@angular/core';
import { Component, Input, output, viewChild } from '@angular/core';

import type { SortType } from '@pipes';
import type { SettingsButtonsType } from '../../common/settings-buttons';

import { filterItemAppear } from '../../common/animations';

@Component({
  standalone: false,
  selector: 'app-sort-order',
  templateUrl: './sort-order.component.html',
  styleUrls: [
    '../settings.scss',
    './sort-order.component.scss'
  ],
  animations: [filterItemAppear]
})
export class SortOrderComponent {

  readonly sortFilterElement = viewChild<ElementRef>('sortFilterElement');

  readonly sortTypeChange = output<SortType>();

  @Input() settingsButtons: SettingsButtonsType;

  constructor() { }

}
