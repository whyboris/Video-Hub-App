import { Pipe, PipeTransform } from '@angular/core';

import { SortingPipe } from './sorting.pipe';

import { ImageElement } from '../common/final-object.interface';

type DupeType = 'length' | 'size' | 'hash';

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

      if (dupeType === 'length') {

        console.log('DUPLICATE FINDER PIPE WORKING');

        const duplicateArray: ImageElement[] = [];

        const sortedByLength: ImageElement[] = this.sortingPipe.transform(finalArray, 'timeDesc', 9001);

        let lengthTracker: number = 0;

        let lastIndex: number = -1; // keep track of the index of the last item pushed to duplicateArray

        sortedByLength.forEach((element, idx) => {

          if (Math.abs(lengthTracker - element.duration) < 5) {
            if (lastIndex !== (idx - 1)) {
              // in case you have 3 identical in a row!
              duplicateArray.push(sortedByLength[idx - 1]);
            }
            duplicateArray.push(element);
            lastIndex = idx;
          }

          lengthTracker = element.duration;
        });

        return duplicateArray;

      } else if (dupeType === 'size') {

        console.log('DUPLICATE FINDER PIPE WORKING');

        const duplicateArray: ImageElement[] = [];

        const sortedBySize: ImageElement[] = this.sortingPipe.transform(finalArray, 'sizeDesc', 9001);

        let sizeTracker: number = 0;

        let lastIndex: number = -1; // keep track of the index of the last item pushed to duplicateArray

        sortedBySize.forEach((element, idx) => {

          if (Math.abs(sizeTracker - element.fileSize) < 1000) {
            if (lastIndex !== (idx - 1)) {
              // in case you have 3 identical in a row!
              duplicateArray.push(sortedBySize[idx - 1]);
            }
            duplicateArray.push(element);
            lastIndex = idx;
          }

          sizeTracker = element.fileSize;
        });

        return duplicateArray;

      } else if (dupeType === 'hash') {

        console.log('DUPLICATE FINDER PIPE WORKING');

        const duplicateArray: ImageElement[] = [];

        const sortedByHash: ImageElement[] = this.sortingPipe.transform(finalArray, 'hash', 9001);

        let hashTracker: string = '';

        let lastIndex: number = -1; // keep track of the index of the last item pushed to duplicateArray

        sortedByHash.forEach((element, idx) => {

          if (hashTracker === element.hash) {
            if (lastIndex !== (idx - 1)) {
              // in case you have 3 identical in a row!
              duplicateArray.push(sortedByHash[idx - 1]);
            }
            duplicateArray.push(element);
            lastIndex = idx;
          }

          hashTracker = element.hash;
        });

        return duplicateArray;

      }

    }
  }

}
