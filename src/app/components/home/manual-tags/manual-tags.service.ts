import { Injectable } from '@angular/core';

import { ImageElement } from '../../common/final-object.interface';

@Injectable()
export class ManualTags {

  tagsMap: Map<string, number> = new Map();
  tagsList: string[] = [];

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
  populateManualTags(allFiles: ImageElement[]): void {
    allFiles.forEach((element: ImageElement): void => {
      element.tags.forEach((tag: string): void => {
        this.addTag(tag);
      });
    });

    console.log('done populating manual tags:');
    console.log(this.tagsList);
    console.log(this.tagsMap);
  }

}
