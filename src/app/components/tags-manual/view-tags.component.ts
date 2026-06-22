import type { ElementRef} from '@angular/core';
import { Component, Input, input, output, viewChild } from '@angular/core';

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
  toogleBatchModeValue: boolean = false;

  @Input()
  set tags(tags: Tag[] | string[]) {
    if (!tags || tags.length === 0) {
      this._tags = [];
    } else if ((typeof tags[0]) === 'string') {
      this._tags = this.stringToTagObject(<string[]>tags); // happens only in tag tray
    } else {
      this._tags = <Tag[]>tags; // happens in details & meta view
    }
  }

  //set the removable property of the selected tag based on the batchmode is enabled or disabled
  @Input()
  set tagsOnToggleBatch(toggleBatchMode: boolean) {
    this.toogleBatchModeValue = toggleBatchMode;
    if (this._tags) {
      this._tags.forEach((item) => {
        item.removable = toggleBatchMode;
      });
    }
  }

  readonly darkMode = input<boolean>(undefined);
  readonly displayFrequency = input<boolean>(undefined);
  readonly draggable = input<boolean>(undefined);
  readonly enableColorPicker = input<boolean>(false);

  readonly removeTagEmit = output<string>();
  readonly tagClicked = output<TagEmit>();
  readonly tagRightClick = output<{ tag: Tag; event: MouseEvent; }>();

  readonly dragHack = viewChild<ElementRef>('dragHack');

  constructor(
    public tagService: ManualTagsService
  ) { }

  /**
   * Emit to parent component a tag has been clicked
   */
  tagClick(tag: Tag, event: MouseEvent): void {
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
        removable: this.toogleBatchModeValue,
        colour: this.tagService.getTagColor(tag),
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

    const quickHack: Element = this.dragHack().nativeElement;

    quickHack.innerHTML = (event.target as HTMLElement).innerText;

    event.dataTransfer.setDragImage(quickHack, event.offsetX * 1.5, 21);
  }

  /**
   * Handle right-click on tag - emit to parent to handle color picker
   * @param event - MouseEvent
   * @param tag - Tag
   */
  onTagRightClick(event: MouseEvent, tag: Tag): void {
    if (!this.enableColorPicker()) {
      return;
    }

    // Only allow color picking for manual (removable) tags
    if (!tag.removable) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    // Emit to parent component to handle color picker
    this.tagRightClick.emit({ tag, event });
  }

  /**
   * Calculate contrast color (white or black) based on background color luminance
   * @param hexColor - Hex color code (e.g., '#FF6B6B')
   * @returns 'white' or 'black' for optimal contrast
   */
  getContrastColor(hexColor: string): string {
    if (!hexColor) {
      return 'black';
    }

    // Remove # if present
    const hex = hexColor.replace('#', '');

    // Validate hex format (must be 6 characters)
    if (hex.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(hex)) {
      return 'black';
    }

    // Convert to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate relative luminance using WCAG formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return white for dark backgrounds, black for light backgrounds
    return luminance > 0.5 ? 'black' : 'white';
  }

}
