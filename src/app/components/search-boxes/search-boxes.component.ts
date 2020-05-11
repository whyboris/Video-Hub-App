import { Component, Input, Output, EventEmitter } from '@angular/core';
import { filterItemAppear } from '../../common/animations';

interface FilterEmit {
  word: string;
  index: number;
}

@Component({
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

  @Output() checkTagTypeahead = new EventEmitter<string>();
  @Output() onBackspace = new EventEmitter<FilterEmit>();
  @Output() onEnterKey = new EventEmitter<FilterEmit>();
  @Output() removeThisFilter = new EventEmitter<{ item: number, origin: number }>();
  @Output() typeaheadTabPressed = new EventEmitter<number>();

  @Input() filters;
  @Input() settingsButtons;
  @Input() tagTypeAhead;

  constructor() { }

  /**
   * If is tag search & user wrote text & type ahead is recommended, insert full typeahead
   * @param event
   * @param isTagSearch
   * @param filterIndex
   * @param currentText
   */
  handleTabPress(event: Event, isTagSearch: boolean, filterIndex: number, currentText: string): void {
    if (isTagSearch && currentText !== '' && this.tagTypeAhead !== '') {
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
