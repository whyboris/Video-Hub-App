import { Component, Output, EventEmitter } from '@angular/core';
import { ManualTagsService } from './manual-tags.service';

@Component({
  selector: 'app-add-tag-component',
  templateUrl: 'add-tag.component.html',
  styleUrls: ['add-tag.component.scss']
})
export class AddTagComponent {

  @Output() tag = new EventEmitter<string>();

  currentText: string = '';
  typeAhead: string = '';

  constructor(
    public tagService: ManualTagsService
  ) { }

  emitTag(text: string) {
    this.tag.emit(text);
    this.currentText = '';
    this.typeAhead = '';

  }

  checkTypeahead(text: string) {
    this.typeAhead = this.tagService.getTypeahead(text);
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
