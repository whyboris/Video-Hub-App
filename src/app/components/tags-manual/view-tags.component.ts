import type { ElementRef} from '@angular/core';
import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';

import { ManualTagsService } from './manual-tags.service';

import type { Tag, TagEmit } from '../../../../interfaces/shared-interfaces';

@Component({
  standalone: false,
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

  @ViewChild('dragHack', { static: false }) dragHack: ElementRef;

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
   * @param event - DragEvent
   */
  dragStart(event: DragEvent): void {
    event.dataTransfer.setData('text/plain', (event.target as HTMLElement).innerText);

    const quickHack: Element = this.dragHack.nativeElement;

    quickHack.innerHTML = (event.target as HTMLElement).innerText;

    event.dataTransfer.setDragImage(quickHack, event.offsetX * 1.5, 21);
  }

}
