import { Pipe, PipeTransform } from '@angular/core';

import { ManualTagsService } from '../home/tags-manual/manual-tags.service';

@Pipe({
  name: 'manualTagSortPipe'
})
export class ManualTagSortPipe implements PipeTransform {

  constructor(
    public manualTagService: ManualTagsService
  ) {}

  /**
   * Return all the tags by frequency or in alphabetical order
   * @param allTags
   * @param filterString    - remove all tags that do not contain this string
   * @param sortByFrequency - if false, will sort alphabetically
   * @param forceUpdateHack - boolean that is toggled manually to force updating the list
   */
  transform(allTags: string[], filterString: string, sortByFrequency: boolean, forceUpdateHack: boolean): string[] {

    if (filterString !== '') {
      allTags = allTags.filter(tag => tag.includes(filterString));
    }

    let sortedTags: string[];

    if (sortByFrequency) {

      console.log('SORTING BY FREQUENCY !!!');

      sortedTags = allTags.sort((a, b): any => {
        return this.manualTagService.tagsMap.get(a) < this.manualTagService.tagsMap.get(b) ? 1 : -1;
      }).slice();
    } else {
      sortedTags = allTags.sort();
    }

    return sortedTags;
  }

}
