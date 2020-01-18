import { Pipe, PipeTransform } from '@angular/core';

import { ImageElement } from '../../../interfaces/final-object.interface';

// import Fuse from 'fuse.js';
import * as Fuse from 'fuse.js';

@Pipe({
  name: 'fuzzySearchPipe'
})
export class FuzzySearchPipe implements PipeTransform {

  options: Fuse.FuseOptions<ImageElement> = {
    threshold: 0.5, // 0 => perfect match, 1 => match anything
    shouldSort: true,
    maxPatternLength: 32,
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

      return <ImageElement[]>fuse.search(searchString);
    }
  }

}
