import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ManualTags } from './manual-tags.service';

@Component({
  selector: 'app-view-tags-component',
  templateUrl: 'view-tags.component.html',
  styleUrls: ['view-tags.component.scss',
              '../fonts/icons.scss']
})
export class ViewTagsComponent {

  @Input() tags: string[];
  @Input() allowRemoval: boolean;

  @Output() removeTagEmit = new EventEmitter<string>();

  constructor(
    public tagService: ManualTags
  ) { }

  removeTag(tag: string): void {
    console.log('remove tag clicked');
    this.removeTagEmit.emit(tag);
  }

}
