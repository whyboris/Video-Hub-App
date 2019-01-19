import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lengthFilterPipe'
})
export class LengthFilterPipe implements PipeTransform {

  /**
   * Filter and show only videos that are within the resolution bounds
   * @param finalArray
   * @param render
   * @param leftBound
   * @param rightBound
   */
  transform(finalArray: any, render?: boolean, leftBound?: number, rightBound?: number): any {

    if (render && finalArray.length > 0) {
      return finalArray.filter((element) => {
        const duration = element.duration;
        if ( duration > leftBound && duration < rightBound) {
          return true;
        } else {
          return false;
        }
      });
    }
    return finalArray;
  }
}
