import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ManualTagsService } from './manual-tags.service';
import { Tag } from '../tags/tags.service';

@Component({
  selector: 'app-view-tags-component',
  templateUrl: 'view-tags.component.html',
  styleUrls: ['view-tags.component.scss',
              '../fonts/icons.scss']
})
export class ViewTagsComponent {

  @Input() tags: Tag[];
  @Input() displayFrequency: boolean;

  @Output() removeTagEmit = new EventEmitter<string>();

  constructor(
    public tagService: ManualTagsService
  ) { }

  removeTag(tag: string): void {
    console.log('remove tag clicked');
    this.removeTagEmit.emit(tag);
  }

}
