import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

import type { ImageElement } from '@my/final-object.interface';

@Pipe({
  name: 'magicSearchPipe'
})
export class MagicSearchPipe implements PipeTransform {

  /**
   * Return only items that match search string
   * @param finalArray
   * @param searchString  the search string
   */
  transform(finalArray: ImageElement[], searchString?: string): ImageElement[] {
    if (searchString === '') {
      return finalArray;
    } else {
      // console.log('magic search pipe working');
      return finalArray.filter(item =>
        item.partialPath.toLowerCase().indexOf(searchString.toLowerCase()) !== -1
        || item.fileName.toLowerCase().indexOf(searchString.toLowerCase()) !== -1
        || (item.tags && item.tags.join().toLowerCase().indexOf(searchString.toLowerCase()) !== -1)
      );
    }
  }
}
