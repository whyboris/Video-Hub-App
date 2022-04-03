import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

import type { ImageElement } from '../../../interfaces/final-object.interface';

@Pipe({
  name: 'timesPlayedFilterPipe'
})
export class TimesPlayedFilterPipe implements PipeTransform {

  /**
   * Filter and show only videos that are within the fileSize bounds
   * @param finalArray
   * @param render
   * @param leftBound
   * @param rightBound
   */
  transform(finalArray: ImageElement[], render?: boolean, leftBound?: number, rightBound?: number): ImageElement[] {

    if (render && finalArray.length > 0) {
      return finalArray.filter((element) => {
        const timesPlayed = element.timesPlayed;
        if ( timesPlayed > leftBound && timesPlayed < rightBound) {
          return true;
        } else {
          return false;
        }
      });
    }
    return finalArray;
  }
}
