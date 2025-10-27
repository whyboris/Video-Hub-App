import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import type { ImageElement } from '../../../../interfaces/final-object.interface';
import type { ColorPickerPosition } from '../tag-color-picker/tag-color-picker.component';

@Injectable()
export class ManualTagsService {

  tagsMap: Map<string, number> = new Map(); // map tag name to its frequency
  tagsList: string[] = [];
  tagColors: Record<string, string> = {}; // map tag name to its color
  pipeToggleHack = false;

  // Color picker state - shared across all components
  showColorPickerSubject = new Subject<{ tagName: string, currentColor: string, position: ColorPickerPosition }>();
  hideColorPickerSubject = new Subject<void>();
  tagColorUpdatedSubject = new Subject<void>(); // Notify when tag color changes

  constructor() { }

  /**
   * Update the tagsList & tagsMap with the tag
   * @param tag - tag to be added
   */
  addTag(tag: string): void {
    if (this.tagsMap.get(tag)) {
      const count = this.tagsMap.get(tag);
      this.tagsMap.set(tag, count + 1);
    } else {
      this.tagsMap.set(tag, 1);
      this.tagsList.push(tag);
    }
    this.forceTagSortPipeUpdate();
  }

  removeTag(tag: string): void {
    const count = this.tagsMap.get(tag);
    this.tagsMap.set(tag, count - 1);

    if (count === 1) {
      this.tagsList.splice(this.tagsList.indexOf(tag), 1);
    }
    this.forceTagSortPipeUpdate();
  }

  /**
   * Removes all the existing tags in {@code tagList} and {@code tagsMap}
   */
  removeAllTags(): void {
    this.tagsMap.clear();
    this.tagsList = [];
  }

  /**
   * Get the most likely tag
   * TODO -- curently it gets the FIRST match; later get the MOST COMMON (confer with tagsMap)
   * @param text
   */
  getTypeahead(text: string): string {
    let mostLikely = '';

    if (text) {
      for (let i = 0; i < this.tagsList.length; i++) {
        if (this.tagsList[i].startsWith(text)) {
          mostLikely = this.tagsList[i];
          break;
        }
      }
    }

    return mostLikely;
  }

  /**
   * Generate the tagsList and tagsMap the first time a hub is opened
   * @param allFiles - ImageElement array
   */
  populateManualTagsService(allFiles: ImageElement[]): void {
    allFiles.forEach((element: ImageElement): void => {
      if (element.tags) {
        element.tags.forEach((tag: string): void => {
          this.addTag(tag);
        });
      }
    });

    // console.log('done populating manual tags:');
    // console.log(this.tagsList);
    // console.log(this.tagsMap);
  }

  forceTagSortPipeUpdate(): void {
    this.pipeToggleHack = !this.pipeToggleHack;
  }

  /**
   * Set the color for a tag
   * @param tagName - name of the tag
   * @param color - color hex code or null to remove color
   */
  setTagColor(tagName: string, color: string | null): void {
    if (color === null || color === undefined) {
      delete this.tagColors[tagName];
    } else {
      this.tagColors[tagName] = color;
    }
    // Notify all components that tag colors have been updated
    this.tagColorUpdatedSubject.next();
  }

  /**
   * Get the color for a tag
   * @param tagName - name of the tag
   * @returns color hex code or undefined if no color set
   */
  getTagColor(tagName: string): string | undefined {
    return this.tagColors[tagName];
  }

  /**
   * Load tag colors from saved data
   * @param tagColors - Record of tag name to color mapping
   */
  loadTagColors(tagColors: Record<string, string> | undefined): void {
    this.tagColors = tagColors || {};
  }

  /**
   * Get all tag colors for saving
   * @returns Record of tag name to color mapping
   */
  getTagColors(): Record<string, string> {
    return this.tagColors;
  }

}
