import type { ElementRef} from '@angular/core';
import { Component, Input, output, viewChild } from '@angular/core';

import type { SortType } from '../../pipes/sorting.pipe';
import { sortFilterAppear } from '../../common/animations';
import type { SettingsButtonsType } from '../../common/settings-buttons';

@Component({
  standalone: false,
  selector: 'app-sort-order',
  templateUrl: './sort-order.component.html',
  styleUrls: [
    '../settings.scss',
    './sort-order.component.scss'
  ],
  animations: [sortFilterAppear]
})
export class SortOrderComponent {

  readonly sortFilterElement = viewChild<ElementRef>('sortFilterElement');

  readonly sortTypeChange = output<SortType>();

  @Input() settingsButtons: SettingsButtonsType;

  constructor() { }

}
