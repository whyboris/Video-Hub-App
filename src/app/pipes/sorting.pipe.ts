import { Pipe, PipeTransform } from '@angular/core';
import { ImageElement, StarRating } from '../../../interfaces/final-object.interface';

export type SortType = 'default'
                     | 'hash' // only used by the duplicateFinderPipe
                     | 'alphabetAsc'
                     | 'alphabetDesc'
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
    if (x.fileName === '*UP*') {
      return -1;
    } else if (y.fileName === '*UP*') {
      return 1;
    }

    if (property === 'alphabetical') {
      if (x.fileName < y.fileName) {
        return decreasing ? -1 : 1;
      } if (x.fileName > y.fileName) {
        return decreasing ? 1 : -1;
      } else {
        return 0;
      }
    }

    if (property === 'hash') {
      if (x.hash < y.hash) {
        return -1;
      } if (x.hash > y.hash) {
        return 1;
      } else {
        return 0;
      }
    }

    // handle `year` case:   show properties that are not empty first
    if (property === 'year') {
      if (decreasing) {
        return (x.year || Infinity) - (y.year || Infinity);
      } else {
        return (y.year || 0)        - (x.year || 0);
      }
    }

    // handle `stars` case:  show properties that are not empty first
    if (property === 'stars') {
      if (decreasing) {
        return (  x.stars === <StarRating><unknown>0.5 ? Infinity : x.stars)
               - (y.stars === <StarRating><unknown>0.5 ? Infinity : y.stars);
      } else {
        return (  y.stars === <StarRating><unknown>0.5 ? 0        : y.stars)
               - (x.stars === <StarRating><unknown>0.5 ? 0        : x.stars);
      }
    }

    if (decreasing) {
      return (x[property]) - (y[property]);
    } else {
      return (y[property]) - (x[property]);
    }

  }

  /**
   * Return the same array randomized on next search
   * @param galleryArray
   * @param sortingType         - sorting method
   * @param forceSortUpdateHack - hack to force the sorting update
   * @param skip                - whether to sort or return as is (needed for DUPLICATE SEARCH)
   */
  transform(galleryArray: ImageElement[], sortingType: SortType, forceSortUpdateHack: number, skip: boolean): ImageElement[] {

    // console.log('SORTING RUNNING');
    // console.log(sortingType);

    if (skip) {
      // console.log('skipping !!!');
      return galleryArray;
    } else if (sortingType === 'random') {

      if (galleryArray.length === 0) {
        return []; // else `galleryArray[0] errors out!
      }

      let currentIndex = (galleryArray[0].fileName === '*UP*' ? 1 : 0); // skip 'up button' if present
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
      // console.log('VIEW SHUFFLED');
      return newArray;

    } else if (sortingType === 'alphabetAsc') {
      return galleryArray.slice(0).sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'alphabetical', true);
      });
    } else if (sortingType === 'alphabetDesc') {
      return galleryArray.slice(0).sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'alphabetical', false);
      });
    } else if (sortingType === 'sizeAsc') {
      return galleryArray.slice(0).sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'fileSize', true);
      });
    } else if (sortingType === 'sizeDesc') {
      return galleryArray.slice(0).sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'fileSize', false);
      });
    } else if (sortingType === 'timeAsc') {
      return galleryArray.slice(0).sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'duration', true);
      });
    } else if (sortingType === 'timeDesc') {
      return galleryArray.slice(0).sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'duration', false);
      });
    } else if (sortingType === 'starAsc') {
      return galleryArray.slice(0).sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'stars', true);
      });
    } else if (sortingType === 'starDesc') {
      return galleryArray.slice(0).sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'stars', false);
      });
    } else if (sortingType === 'yearAsc') {
      return galleryArray.slice(0).sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'year', true);
      });
    } else if (sortingType === 'yearDesc') {
      return galleryArray.slice(0).sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'year', false);
      });
    } else if (sortingType === 'timesPlayedAsc') {
      return galleryArray.slice(0).sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'timesPlayed', true);
      });
    } else if (sortingType === 'timesPlayedDesc') {
      return galleryArray.slice(0).sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'timesPlayed', false);
      });
    } else if (sortingType === 'modifiedAsc') {
      return galleryArray.slice(0).sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'mtime', true);
      });
    } else if (sortingType === 'modifiedDesc') {
      return galleryArray.slice(0).sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'mtime', false);
      });
    } else if (sortingType === 'hash') {
      return galleryArray.slice(0).sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'hash', true);
      });
    } else {
      return galleryArray.slice(0).sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'index', true);
      });
    }

  }

}
