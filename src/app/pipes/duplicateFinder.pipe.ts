import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

import { SortingPipe } from './sorting.pipe';

import type { ImageElement } from '../../../interfaces/final-object.interface';

type DupeType = 'length'   | 'size'     | 'hash';
type SortBy =   'timeDesc' | 'sizeDesc' | 'hash';
type Feature =  'duration' | 'fileSize' | 'hash';

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
   * @param dupeType    whether to find duplicates by length
   */
  transform(finalArray: ImageElement[], render, dupeType: DupeType): ImageElement[] {
    if (!render) {
      return finalArray;
    } else {

      let sortBy: SortBy = undefined;
      let initial: any = undefined; // number | string
      let feature: Feature = undefined;
      let comparison: Function = undefined;

      switch (dupeType) {
        case 'length':
          // console.log('DUPLICATE by LENGTH');
          sortBy = 'timeDesc';
          initial = 0;
          feature = 'duration';
          comparison = (a, b): boolean => { return Math.abs(a - b) < 1; };
          break;

      case 'size':
          // console.log('DUPLICATE by SIZE');
          sortBy = 'sizeDesc';
          initial = 0;
          feature = 'fileSize';
          comparison = (a, b): boolean => { return Math.abs(a - b) < 500; };
          break;

        case 'hash':
          // console.log('DUPLICATE by HASH');
          sortBy = 'hash';
          initial = '';
          feature = 'hash';
          comparison = (a, b): boolean => { return a === b; };
          break;

        default:
          // console.log('this should never happen!');
          break;
      }

      const sortedByFeature: ImageElement[] = this.sortingPipe.transform(finalArray, sortBy, 9001, false);

      const duplicateArray: ImageElement[] = [];

      let featureTracker: any = initial; // number | string
      let lastIndex = -1; // keep track of the index of the last item pushed to duplicateArray

      sortedByFeature.forEach((element, idx) => {

        if (comparison(featureTracker, element[feature])) {
          if (lastIndex !== (idx - 1)) {
            // in case you have 3 identical in a row!
            duplicateArray.push(sortedByFeature[idx - 1]);
          }
          duplicateArray.push(element);
          lastIndex = idx;
        }

        featureTracker = element[feature];
      });

      return duplicateArray;

    }
  }

}
