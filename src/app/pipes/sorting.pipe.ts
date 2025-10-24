import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { ImageElement, StarRating } from '../../../interfaces/final-object.interface';
import { randomizeArray } from '../../../node/utility';
import { orderBy } from 'natural-orderby';

export type SortType = 'default'
                     | 'alphabetAsc'
                     | 'alphabetAsc2'
                     | 'alphabetDesc'
                     | 'alphabetDesc2'
                     | 'aspectRatioAsc'
                     | 'aspectRatioDesc'
                     | 'createdAsc'
                     | 'createdDesc'
                     | 'folderSizeAsc'
                     | 'folderSizeDesc'
                     | 'fpsAsc'
                     | 'fpsDesc'
                     | 'hash' // only used by the duplicateFinderPipe
                     | 'lastPlayedAsc'
                     | 'lastPlayedDesc'
                     | 'modifiedAsc'
                     | 'modifiedDesc'
                     | 'random'
                     | 'sizeAsc'
                     | 'sizeDesc'
                     | 'starAsc'
                     | 'starDesc'
                     | 'tagsAsc'
                     | 'tagsDesc'
                     | 'timeAsc'
                     | 'timeDesc'
                     | 'timesPlayedAsc'
                     | 'timesPlayedDesc'
                     | 'yearAsc'
                     | 'yearDesc';

@Pipe({
  standalone: false,
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
  sortFunctionLol(
    x: ImageElement,
    y: ImageElement,
    property: string,
    decreasing: boolean
  ): number {
    // up button first
    if (x.fileName === '*UP*') {
      return -1;
    } else if (y.fileName === '*UP*') {
      return 1;
    }

    if (property === 'alphabetical') {
      if (x.fileName.toLowerCase() < y.fileName.toLowerCase()) {
        return decreasing ? -1 : 1;
      } if (x.fileName.toLowerCase() > y.fileName.toLowerCase()) {
        return decreasing ? 1 : -1;
      } else {
        return 0;
      }
    }

    if (property === 'tags') {
      if ((x.tags || []).length < (y.tags || []).length) {
        return decreasing ? -1 : 1;
      } if ((x.tags || []).length > (y.tags || []).length) {
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

    if (property === 'aspectRatio') {
      const xAspectRatio = x.width / x.height;
      const yAspectRatio = y.width / y.height;

      if (xAspectRatio < yAspectRatio) {
        if (decreasing) { return 1; } else { return -1; }
      } if (xAspectRatio > yAspectRatio) {
        if (decreasing) { return -1; } else { return 1; }
      } else {
        return 0;
      }
    }

    if (property === 'folderSize') {

      // want non-folders to be considered "less than" a folder so give negative value by default.
      let xDisplay = -Infinity;
      let yDisplay = -Infinity;

      if (x.cleanName === '*FOLDER*') {
        xDisplay = parseInt(x.fileSizeDisplay, 10);
      }

      if (y.cleanName === '*FOLDER*') {
        yDisplay = parseInt(y.fileSizeDisplay, 10);
      }

      if (xDisplay < yDisplay ) {
        return decreasing ? 1 : -1;
      } if (xDisplay > yDisplay) {
        return decreasing ? -1 : 1;
      } else {
        return 0;
      }

    }

    if (x[property] > y[property]) {
      return decreasing ? 1 : -1;
    } else if (x[property] === y[property]) {
      return 0;
    } else {
      return decreasing ? -1 : 1;
    }

  }

  /**
   * Return the same array randomized on next search
   * @param galleryArray
   * @param sortingType         - sorting method
   * @param forceSortUpdateHack - hack to force the sorting update
   * @param skip                - whether to sort or return as is (needed for DUPLICATE SEARCH)
   */
  transform(
    galleryArray: ImageElement[],
    sortingType: SortType,
    forceSortUpdateHack: number,
    skip: boolean
  ): ImageElement[] {

    // console.log('SORTING RUNNING');
    // console.log(sortingType);

    if (skip) {
      // console.log('skipping !!!');
      return galleryArray;
    } else if (sortingType === 'random') {

      if (galleryArray.length === 0) {
        return []; // else `galleryArray[0] errors out!
      }

      const currentIndex = (galleryArray[0].fileName === '*UP*' ? 1 : 0); // skip 'up button' if present

      return randomizeArray(galleryArray, currentIndex);

    } else if (sortingType === 'default') {
      return galleryArray; // sorting order set via `alphabetizeFinalArray` in `main-support.ts`
      // no need to `.slice()` as all other sorting types do it
    } else if (sortingType === 'alphabetAsc') {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'alphabetical', true);
      });
    } else if (sortingType === 'alphabetDesc') {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): any => {
        return this.sortFunctionLol(x, y, 'alphabetical', false);
      });
    } else if (sortingType === 'alphabetAsc2') {
      if (galleryArray.length && galleryArray[0].fileName === '*UP*') {
        const tempGallery: ImageElement[] = galleryArray.slice();
        const tempUp: ImageElement = tempGallery.shift(); // remove the first element (*UP*)
        return [tempUp, ...orderBy(tempGallery, 'fileName', 'asc')];
      } else {
        return orderBy(galleryArray, 'fileName', 'asc');
      }
    } else if (sortingType === 'alphabetDesc2') {
      if (galleryArray.length && galleryArray[0].fileName === '*UP*') {
        const tempGallery: ImageElement[] = galleryArray.slice();
        const tempUp: ImageElement = tempGallery.shift(); // remove the first element (*UP*)
        return [tempUp, ...orderBy(tempGallery, 'fileName', 'desc')];
      } else {
        return orderBy(galleryArray, 'fileName', 'desc');
      }
    } else if (sortingType === 'sizeAsc') {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): number => {
        return this.sortFunctionLol(x, y, 'fileSize', true);
      });
    } else if (sortingType === 'sizeDesc') {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): number => {
        return this.sortFunctionLol(x, y, 'fileSize', false);
      });
    } else if (sortingType === 'timeAsc') {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): number => {
        return this.sortFunctionLol(x, y, 'duration', true);
      });
    } else if (sortingType === 'timeDesc') {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): number => {
        return this.sortFunctionLol(x, y, 'duration', false);
      });
    } else if (sortingType === 'starAsc') {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): number => {
        return this.sortFunctionLol(x, y, 'stars', true);
      });
    } else if (sortingType === 'starDesc') {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): number => {
        return this.sortFunctionLol(x, y, 'stars', false);
      });
    } else if (sortingType === 'yearAsc') {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): number => {
        return this.sortFunctionLol(x, y, 'year', true);
      });
    } else if (sortingType === 'yearDesc') {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): number => {
        return this.sortFunctionLol(x, y, 'year', false);
      });
    } else if (sortingType === 'lastPlayedAsc') {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): number => {
        return this.sortFunctionLol(x, y, 'lastPlayed', false);
      });
    } else if (sortingType === 'lastPlayedDesc') {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): number => {
        return this.sortFunctionLol(x, y, 'lastPlayed', true);
      });
    } else if (sortingType === 'timesPlayedAsc') {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): number => {
        return this.sortFunctionLol(x, y, 'timesPlayed', true);
      });
    } else if (sortingType === 'timesPlayedDesc') {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): number => {
        return this.sortFunctionLol(x, y, 'timesPlayed', false);
      });
    } else if (sortingType === 'modifiedAsc') {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): number => {
        return this.sortFunctionLol(x, y, 'mtime', true);
      });
    } else if (sortingType === 'modifiedDesc') {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): number => {
        return this.sortFunctionLol(x, y, 'mtime', false);
      });
    } else if (sortingType === 'createdAsc') {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): number => {
        return this.sortFunctionLol(x, y, 'birthtime', true);
      });
    } else if (sortingType === 'createdDesc') {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): number => {
        return this.sortFunctionLol(x, y, 'birthtime', false);
      });
    } else if (sortingType === 'hash') {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): number => {
        return this.sortFunctionLol(x, y, 'hash', true);
      });
    } else if (sortingType === 'tagsAsc') {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): number => {
        return this.sortFunctionLol(x, y, 'tags', true);
      });
    } else if (sortingType === 'tagsDesc') {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): number => {
        return this.sortFunctionLol(x, y, 'tags', false);
      });
    } else if (sortingType === 'aspectRatioAsc') {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): number => {
        return this.sortFunctionLol(x, y, 'aspectRatio', false);
      });
    } else if (sortingType === 'aspectRatioDesc') {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): number => {
        return this.sortFunctionLol(x, y, 'aspectRatio', true);
      });
    } else if (sortingType === 'folderSizeAsc') {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): number => {
        return this.sortFunctionLol(x, y, 'folderSize', false);
      });
    } else if (sortingType === 'folderSizeDesc') {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): number => {
        return this.sortFunctionLol(x, y, 'folderSize', true);
      });
    } else if (sortingType === 'fpsAsc') {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): number => {
        return this.sortFunctionLol(x, y, 'fps', true);
      });
    } else if (sortingType === 'fpsDesc') {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): number => {
        return this.sortFunctionLol(x, y, 'fps', false);
      });
    } else {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): number => {
        return this.sortFunctionLol(x, y, 'index', true);
      });
    }
  }
}
