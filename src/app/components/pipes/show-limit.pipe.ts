import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'limitPipe'
})
export class LimitPipe implements PipeTransform {

  /**
   * Return only items that match search string
   * @param finalArray
   * @param args            the search string
   */
  transform(finalArray: any, args?: string): any {
    if (args === '') {
      return finalArray;
    } else {
      console.log('file search pipe working');
      let shownSoFar = 0;
      return finalArray.filter(item => {
        if (shownSoFar < 10) {
          shownSoFar++;
          return true;
        } else {
          return false;
        }
      });
    }
  }

}
