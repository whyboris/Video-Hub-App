import { Component, Input, input, output } from '@angular/core';
import { filterItemAppear } from '../../common/animations';

import type { SettingsButtonsType } from '../../common/settings-buttons';
import type { FilterObject } from '../../common/filters';

interface FilterEmit {
  word: string;
  index: number;
}

@Component({
  standalone: false,
  selector: 'app-search-boxes',
  templateUrl: './search-boxes.component.html',
  styleUrls: [
      '../search.scss',
      '../search-input.scss',
      './search-boxes.component.scss'
    ],
  animations: [filterItemAppear]
})
export class SearchBoxesComponent {

  readonly checkTagTypeahead = output<string>();
  readonly onBackspace = output<FilterEmit>();
  readonly onEnterKey = output<FilterEmit>();
  readonly removeThisFilter = output<{ item: number; origin: number; }>();
  readonly typeaheadTabPressed = output<number>();

  readonly filters = input<FilterObject[]>();

  @Input() settingsButtons: SettingsButtonsType;

  readonly tagTypeAhead = input();

  constructor() { }

  /**
   * If is tag search & user wrote text & type ahead is recommended, insert full typeahead
   * @param event
   * @param isTagSearch
   * @param filterIndex
   * @param currentText
   */
  handleTabPress(event: KeyboardEvent, isTagSearch: boolean, filterIndex: number, currentText: string): void {
    if (isTagSearch && currentText !== '' && this.tagTypeAhead() !== '') {
      event.preventDefault();
      this.typeaheadTabPressed.emit(filterIndex);
    }
  }

  /**
   * If is tag search, get new typeahead
   * @param currentText
   * @param isTagSearch
   */
  handleInputChange(currentText: string, isTagSearch: boolean): void {
    if (isTagSearch) {
      this.checkTagTypeahead.emit(currentText);
    }
  }

}
