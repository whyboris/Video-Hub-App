import { Component, Output, EventEmitter } from '@angular/core';
import { ManualTags } from './manual-tags.service';

@Component({
  selector: 'app-add-tag-component',
  templateUrl: 'add-tag.component.html',
  styleUrls: ['add-tag.component.scss']
})
export class AddTagComponent {

  @Output() tag = new EventEmitter<string>();

  constructor(
    public tagService: ManualTags
  ) { }

  emitTag(text: string) {
    console.log(text);
    this.tag.emit(text);
  }

}
