import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'limitPipe'
})
export class LimitPipe implements PipeTransform {

  /**
   * Return only items that match search string
   * @param finalArray
   * @param itemLimit    {number} Maximum number of items to show in results
   */
  transform(finalArray: any, itemLimit?: number): any {
    if (itemLimit === 0) {
      return finalArray;
    } else {
      console.log('file search pipe working');
      let shownSoFar = 0;
      return finalArray.filter(item => {
        if (shownSoFar < itemLimit) {
          shownSoFar++;
          return true;
        } else {
          return false;
        }
      });
    }
  }

}
