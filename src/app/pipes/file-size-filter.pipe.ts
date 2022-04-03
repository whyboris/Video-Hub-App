import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

import type { ImageElement } from '../../../interfaces/final-object.interface';

@Pipe({
  name: 'fileSizeFilterPipe'
})
export class FileSizeFilterPipe implements PipeTransform {

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
        const fileSize = element.fileSize;
        if ( fileSize > leftBound && fileSize < rightBound) {
          return true;
        } else {
          return false;
        }
      });
    }
    return finalArray;
  }
}
