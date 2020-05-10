import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ManualTagsService } from './manual-tags.service';
import { Tag, TagEmit } from '../../../../interfaces/shared-interfaces';

@Component({
  selector: 'app-view-tags-component',
  templateUrl: 'view-tags.component.html',
  styleUrls: ['../search.scss',
              'view-tags.component.scss',
              '../../fonts/icons.scss']
})
export class ViewTagsComponent {

  _tags: Tag[];

  @Input()
  set tags(tags: Tag[] | string[]) {
    if ((typeof tags[0]) === 'string') {
      this._tags = this.stringToTagObject(<string[]>tags); // happens only in tag tray
    } else {
      this._tags = <Tag[]>tags; // happens in details & meta view
    }
  }

  @Input() darkMode: boolean;
  @Input() displayFrequency: boolean;
  @Input() draggable: boolean;

  @Output() removeTagEmit = new EventEmitter<string>();
  @Output() tagClicked = new EventEmitter<TagEmit>();

  constructor(
    public tagService: ManualTagsService
  ) { }

  /**
   * Emit to parent component a tag has been clicked
   */
  tagClick(tag: Tag, event: Event): void {
    this.tagClicked.emit({ tag, event });
  }

  /**
   * Emit to parent component that a tag should be removed
   */
  removeTag(tag: string): void {
    this.removeTagEmit.emit(tag);
  }

  /**
   * Create tag objects from a string[]
   */
  stringToTagObject(tagList: string[]): Tag[] {
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

  /**
   * Set the dataTransfer with the current tag - to drop over video
   */
  dragStart(event: any): void {
    event.dataTransfer.setData('text/plain', event.target.innerText);
  }

}
