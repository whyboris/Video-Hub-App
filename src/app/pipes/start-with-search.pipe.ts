import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

import type { ImageElement } from '../../../interfaces/final-object.interface';

@Pipe({
  standalone: false,
  name: 'startsWithSearchPipe',
})
export class StartsWithSearchPipe implements PipeTransform {

  /**
   * Return only items that names start with search string
   * @param finalArray
   * @param searchString  the search string
   */
  transform(finalArray: ImageElement[], searchString?: string): ImageElement[] {
    if (searchString.length > 0) {
      return finalArray.filter((item) =>
        item.cleanName.split(' ').find((word) => word.toLowerCase().startsWith(searchString))
      );
    } else {
      return finalArray;
    }
  }
}
