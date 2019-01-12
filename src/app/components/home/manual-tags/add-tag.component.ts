import { Component, Output, EventEmitter } from '@angular/core';
import { ManualTags } from './manual-tags.service';

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
    public tagService: ManualTags
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

}
