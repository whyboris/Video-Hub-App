import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lengthPipe'
})
export class LengthPipe implements PipeTransform {

  /**
   * Return only items that match search string
   * @param numOfSec
   */
  transform(numOfSec: number, arg: any): string {
    if (numOfSec < 30) {
      return '<30sec';
    } else {
      return '>30sec'
    }
  }

}
