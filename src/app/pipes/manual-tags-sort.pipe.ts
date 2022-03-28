import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

import type { ManualTagsService } from '../components/tags-manual/manual-tags.service';

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
      allTags = allTags.filter(tag => (tag.toLowerCase()).includes(filterString.toLowerCase()));
    }

    let sortedTags: string[];

    if (sortByFrequency) {
      sortedTags = allTags.sort((a, b): any => {
        return this.manualTagService.tagsMap.get(a) < this.manualTagService.tagsMap.get(b) ? 1 : -1;
      });
    } else {
      sortedTags = allTags.sort();
    }

    return sortedTags.slice(); // return shallow copy else the view does not update when adding new tags in details view
  }

}
