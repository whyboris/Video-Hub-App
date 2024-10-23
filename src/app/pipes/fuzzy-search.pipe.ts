import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

import type { ImageElement } from '@my/final-object.interface';

import Fuse from 'fuse.js';

@Pipe({
  name: 'fuzzySearchPipe'
})
export class FuzzySearchPipe implements PipeTransform {

  options = {
    threshold: 0.4, // 0 => perfect match, 1 => match anything
    shouldSort: true, // note we disable sorting when fuzzySearchPipe is engaged (searchString > 2)
    minMatchCharLength: 2,
    keys: ['cleanName'],
  };

  /**
   * Return only items that ~fuzzy~ match search string
   * @param finalArray
   * @param searchString  the search string
   */
  transform(finalArray: ImageElement[], searchString?: string): ImageElement[] {

    if (searchString === '' || searchString.length < 3) {
      return finalArray;
    } else {
      const fuse = new Fuse(finalArray, this.options);

      return fuse.search(searchString).map((element) => element.item);
    }
  }

}
