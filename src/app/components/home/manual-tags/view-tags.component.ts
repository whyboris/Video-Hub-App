import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ManualTagsService } from './manual-tags.service';
import { Tag } from '../tags/tag-display.pipe';

@Component({
  selector: 'app-view-tags-component',
  templateUrl: 'view-tags.component.html',
  styleUrls: ['view-tags.component.scss',
              '../fonts/icons.scss']
})
export class ViewTagsComponent {

  _tags: Tag[];

  @Input()
  set tags(tags: Tag[] | string[]) {

    if ((typeof tags[0]) === 'string') {
      this._tags = this.stringToTagObject(<string[]>tags);
    } else {
      this._tags = <Tag[]>tags;
    }

    console.log('HAPPEN HAPPEN');

  }

  @Input() displayFrequency: boolean;
  @Input() darkMode: boolean;

  @Output() tagClicked = new EventEmitter<object>();
  @Output() removeTagEmit = new EventEmitter<string>();

  constructor(
    public tagService: ManualTagsService
  ) { }

  tagClick(tag: Tag, event: Event): void {
    this.tagClicked.emit({ tag, event });
  }

  removeTag(tag: string): void {
    console.log('remove tag clicked');
    this.removeTagEmit.emit(tag);
  }

  stringToTagObject(tagList: string[]): Tag[] {

    console.log('running stringToTagObject');

    const hackList: Tag[] = [];

    tagList.forEach((tag) => {
      hackList.push({
        name: tag,
        colour: undefined,
        removable: false,
      });
    });

    return hackList;
  }

}
