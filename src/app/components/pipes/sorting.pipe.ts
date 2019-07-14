import { Pipe, PipeTransform } from '@angular/core';
import { ImageElement } from '../common/final-object.interface';

export type SortType = 'default'
                     | 'modifiedAsc'
                     | 'modifiedDesc'
                     | 'random'
                     | 'sizeAsc'
                     | 'sizeDesc'
                     | 'starAsc'
                     | 'starDesc'
                     | 'timeAsc'
                     | 'timeDesc'
                     | 'yearAsc'
                     | 'yearDesc'
                     | 'timesPlayedAsc'
                     | 'timesPlayedDesc';

@Pipe({
  name: 'sortingPipe'
})
export class SortingPipe implements PipeTransform {

  /**
   * Helper function for sorting
   * Always moved the `up` folder to the top
   * Sorts everything else according to the `property`
   * @param x
   * @param y
   * @param property
   * @param decreasing -- boolean to tell whether `ascending` or `descending`
   */
  sortFunctionLol(x: ImageElement, y: ImageElement, property: string, decreasing: boolean): number {
    // up button first
    if (x.index === -1) {
      return -1;
    } else if (y.index === -1) {
      return 1;
    }
    if (decreasing) {
      return (x[property] || 0) - (y[property] || 0); // note: || 0 needed for `year` only
    } else {
      return (y[property] || 0) - (x[property] || 0);
    }
  }

  /**
   * Return the same array randomized on next search
   * @param galleryArray
   * @param sortingType - sorting method
   * @param forceSortUpdateHack - hack to force the sorting update
   */
  transform(galleryArray: ImageElement[], sortingType: SortType, forceSortUpdateHack: number): ImageElement[] {

    // console.log('SORTING RUNNING'); // ENABLE AND CHECK IF IT RUNS TOO OFTEN !!!

    if (sortingType === 'random') {
      let currentIndex = (galleryArray[0].index === -1 ? 1 : 0); // skip 'up button' if present
      let temporaryValue;
      let randomIndex;

      const newArray = [...galleryArray];

      // While there remain elements to shuffle...
      while (currentIndex !== galleryArray.length) {
        // Pick a remaining element...
        randomIndex = currentIndex + Math.floor(Math.random() * (galleryArray.length - currentIndex));

        // And swap it with the current element.
        temporaryValue = newArray[currentIndex];
        newArray[currentIndex] = newArray[randomIndex];
        newArray[randomIndex] = temporaryValue;

        currentIndex += 1;
      }
      console.log('VIEW SHUFFLED');
      return newArray;
    } else if (sortingType === 'sizeAsc') {
      const sorted = galleryArray.sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'fileSize', true);
      });
      return sorted.slice(0); // SEND BACK A CLONE - else the vied does not update
    } else if (sortingType === 'sizeDesc') {
      const sorted = galleryArray.sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'fileSize', false);
      });
      return sorted.slice(0);
    } else if (sortingType === 'timeAsc') {
      const sorted = galleryArray.sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'duration', true);
      });
      return sorted.slice(0);
    } else if (sortingType === 'timeDesc') {
      const sorted = galleryArray.sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'duration', false);
      });
      return sorted.slice(0);
    } else if (sortingType === 'starAsc') {
      const sorted = galleryArray.sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'stars', true);
      });
      return sorted.slice(0);
    } else if (sortingType === 'starDesc') {
      const sorted = galleryArray.sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'stars', false);
      });
      return sorted.slice(0);
    } else if (sortingType === 'yearAsc') {
      const sorted = galleryArray.sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'year', false);
      });
      return sorted.slice(0);
    } else if (sortingType === 'yearDesc') {
      const sorted = galleryArray.sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'year', false);
      });
      return sorted.slice(0);
    } else if (sortingType === 'timesPlayedAsc') {
      const sorted = galleryArray.sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'timesPlayed', true);
      });
      return sorted.slice(0);
    } else if (sortingType === 'timesPlayedDesc') {
      const sorted = galleryArray.sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'timesPlayed', false);
      });
      return sorted.slice(0);
    } else if (sortingType === 'modifiedAsc') {
      const sorted = galleryArray.sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'mtime', true);
      });
      return sorted.slice(0);
    } else if (sortingType === 'modifiedDesc') {
      const sorted = galleryArray.sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'mtime', false);
      });
      return sorted.slice(0);
    } else {
      // console.log('default sort'); // TODO -- Re-enable and optimize!
      const sorted = galleryArray.sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'index', true);
      });
      return sorted.slice(0);
    }

  }

}
