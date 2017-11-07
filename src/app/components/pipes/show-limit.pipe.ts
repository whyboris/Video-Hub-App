import { Pipe, PipeTransform } from '@angular/core';

import { ShowLimitService } from './show-limit.service';

@Pipe({
  name: 'limitPipe'
})
export class LimitPipe implements PipeTransform {

  constructor(
    public showLimitService: ShowLimitService
  ) { }

  /**
   * Return only items that match search string
   * @param finalArray
   * @param itemLimit    {number} Maximum number of items to show in results
   */
  transform(finalArray: any, itemLimit?: number): any {
    if (itemLimit === 0) {
      this.showLimitService.showResults(finalArray.length, finalArray.length);
      return finalArray;
    } else {
      console.log('file search pipe working');
      let shownSoFar = 0;
      this.showLimitService.showResults(itemLimit, finalArray.length);
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
