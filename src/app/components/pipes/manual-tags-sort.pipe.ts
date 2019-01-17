import { Pipe, PipeTransform } from '@angular/core';

import { ManualTagsService } from '../home/manual-tags/manual-tags.service';

@Pipe({
  name: 'manualTagSortPipe'
})
export class ManualTagSortPipe implements PipeTransform {

  constructor(
    public manualTagService: ManualTagsService
  ) {}

  /**
   * Return all the tags by frequency or in alphabetical order
   * @param someTag
   * @param sortByFrequency - if false, will sort alphabetically
   * @param forceUpdateHack - boolean that is toggled manually to force updating the list
   */
  transform(someTag: string[], sortByFrequency: boolean, forceUpdateHack: boolean): string[] {

    console.log('pipe Running!');

    let sortedTags: string[];

    if (sortByFrequency) {
      sortedTags = someTag.sort((a, b): any => {
        return this.manualTagService.tagsMap.get(a) < this.manualTagService.tagsMap.get(b);
      });
    } else {
      sortedTags = someTag.sort();
    }

    return sortedTags;
  }

}
