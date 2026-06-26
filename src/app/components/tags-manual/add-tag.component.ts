import { Component, input, output } from '@angular/core';
import { ManualTagsService } from './manual-tags.service';

@Component({
  standalone: false,
  selector: 'app-add-tag-component',
  templateUrl: 'add-tag.component.html',
  styleUrls: ['../search-input.scss',
              'add-tag.component.scss']
})
export class AddTagComponent {

  readonly darkMode = input<boolean>();

  readonly tag = output<string>();

  currentText = '';
  typeAhead = '';

  constructor(
    public manualTagsService: ManualTagsService
  ) { }

  emitTag(text: string) {
    if (text.trim()) { // if not empty
      this.tag.emit(text.trim());
      this.currentText = '';
      this.typeAhead = '';
    }
  }

  checkTypeahead(text: string) {
    this.typeAhead = this.manualTagsService.getTypeahead(text);
  }

  tabPressed(keypress: KeyboardEvent): void {
    if (this.typeAhead !== '') {
      this.emitTag(this.typeAhead);
      keypress.preventDefault();
    }
  }

  /**
   * User pressed the `esc` key
   */
  escape(): void {
    this.currentText = '';
    this.typeAhead = '';
  }

}
