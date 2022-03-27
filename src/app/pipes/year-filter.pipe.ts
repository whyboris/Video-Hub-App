import { Pipe, PipeTransform } from '@angular/core';

import { ImageElement } from '../../../interfaces/final-object.interface';

@Pipe({
  name: 'yearFilterPipe'
})
export class YearFilterPipe implements PipeTransform {

  /**
   * Filter and show only videos that are within the year bounds
   * @param finalArray
   * @param render
   * @param leftBound
   * @param rightBound
   */
  transform(finalArray: ImageElement[], render?: boolean, leftBound?: number, rightBound?: number): ImageElement[] {

    if (render && finalArray.length > 0) {
      return finalArray.filter((element) => {
        const year = element.year;
        if ( year > leftBound && year < rightBound) {
          return true;
        } else {
          return false;
        }
      });
    }
    return finalArray;
  }
}
