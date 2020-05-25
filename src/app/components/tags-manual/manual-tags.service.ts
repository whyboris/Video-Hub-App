import { Injectable } from '@angular/core';

@Injectable()
export class ManualTagsService {

  tagsMap: Map<string, number> = new Map(); // map tag name to its frequency
  tagsList: string[] = [];
  pipeToggleHack: boolean = false;

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

  forceTagSortPipeUpdate(): void {
    this.pipeToggleHack = !this.pipeToggleHack;
  }

}
