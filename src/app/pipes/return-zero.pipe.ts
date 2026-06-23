import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

import type { ImageElement } from '../../../interfaces/final-object.interface';

@Pipe({
  standalone: false,
  name: 'returnZeroPipe'
})
export class ReturnZeroPipe implements PipeTransform {

  /**
   * Return zero results when `returnZero` is toggled
   * Used for clips view when no clips were extracted
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
