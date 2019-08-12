import { Pipe, PipeTransform } from '@angular/core';

import { SortingPipe } from './sorting.pipe';

import { ImageElement } from '../common/final-object.interface';

@Pipe({
  name: 'duplicateFinderPipe'
})
export class DuplicateFinderPipe implements PipeTransform {

  constructor(
    public sortingPipe: SortingPipe
  ) { }

  /**
   * Return only items that match search string
   * @param finalArray
   * @param render      boolean - whether to use the pipe
   * @param byLength    boolean - whether to find duplicates by length
   */
  transform(finalArray: ImageElement[], render: boolean, byLength?: boolean): ImageElement[] {
    if (!render) {
      return finalArray;
    } else {
      console.log('DUPLICATE FINDER PIPE WORKING');

      const duplicateArray: ImageElement[] = [];

      const sortedByLength: ImageElement[] = this.sortingPipe.transform(finalArray, 'timeDesc', 9001);

      let lengthTracker: number = 0;

      sortedByLength.forEach((element) => {

        if ((lengthTracker - element.duration) < 10) {
          duplicateArray.push(element);
        }

        lengthTracker = element.duration;
      });

      return duplicateArray;
    }
  }

}
