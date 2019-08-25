import { Component, Output, EventEmitter, Input } from '@angular/core';
import { ManualTagsService } from './manual-tags.service';

@Component({
  selector: 'app-add-tag-component',
  templateUrl: 'add-tag.component.html',
  styleUrls: ['../search-input.scss',
              'add-tag.component.scss']
})
export class AddTagComponent {

  @Input() darkMode: boolean;

  @Output() tag = new EventEmitter<string>();

  currentText: string = '';
  typeAhead: string = '';

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

  tabPressed($event): void {
    if (this.typeAhead !== '') {
      this.emitTag(this.typeAhead);
      $event.preventDefault();
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
