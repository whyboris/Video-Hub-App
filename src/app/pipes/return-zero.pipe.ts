import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

import type { ImageElement } from '../../../interfaces/final-object.interface';

@Pipe({
  name: 'returnZeroPipe'
})
export class ReturnZeroPipe implements PipeTransform {

  /**
   * Return only items that match search string
   * @param finalArray
   * @param returnZero    {boolean} Hack to return zero results
   */
  transform(finalArray: ImageElement[], returnZero?: boolean): ImageElement[] {

    if (returnZero) {
      return [];
    } else {
      return finalArray;
    }
  }

}
