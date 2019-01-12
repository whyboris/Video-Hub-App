import { Injectable } from '@angular/core';

@Injectable()
export class ManualTags {

  tagsMap: Map<string, number> = new Map();
  tagsList: string[] = [];

  constructor() { }

  addTag(tag: string): void {
    console.log('tag service:');

    if (this.tagsMap.get(tag)) {
      const count = this.tagsMap.get(tag);
      this.tagsMap.set(tag, count + 1);
    } else {
      this.tagsMap.set(tag, 1);
      this.tagsList.push(tag);
    }

    console.log(this.tagsMap);
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

}
