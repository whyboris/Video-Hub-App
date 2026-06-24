import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { ImageElement, StarRating } from '@my/final-object.interface';
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
                     | 'playlistAsc'
                     | 'playlistDesc'
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

type SortOrderType =  keyof ImageElement | 'folderSize' | 'alphabetical' | 'aspectRatio';

const sortMapping: Partial<Record<SortType, [SortOrderType, boolean]>> = {
  alphabetAsc:     ['alphabetical', true],
  alphabetDesc:    ['alphabetical', false],
  aspectRatioAsc:  ['aspectRatio',  true],
  aspectRatioDesc: ['aspectRatio',  false],
  createdAsc:      ['birthtime',    true],
  createdDesc:     ['birthtime',    false],
  folderSizeAsc:   ['folderSize',   true],
  folderSizeDesc:  ['folderSize',   false],
  fpsAsc:          ['fps',          true],
  fpsDesc:         ['fps',          false],
  hash:            ['hash',         true], // intentionally only one
  lastPlayedAsc:   ['lastPlayed',   true],
  lastPlayedDesc:  ['lastPlayed',   false],
  modifiedAsc:     ['mtime',        true],
  modifiedDesc:    ['mtime',        false],
  playlistAsc:     ['playlist',     true],
  playlistDesc:    ['playlist',     false],
  sizeAsc:         ['fileSize',     true],
  sizeDesc:        ['fileSize',     false],
  starAsc:         ['stars',        true],
  starDesc:        ['stars',        false],
  tagsAsc:         ['tags',         true],
  tagsDesc:        ['tags',         false],
  timeAsc:         ['duration',     true],
  timeDesc:        ['duration',     false],
  timesPlayedAsc:  ['timesPlayed',  true],
  timesPlayedDesc: ['timesPlayed',  false],
  yearAsc:         ['year',         true],
  yearDesc:        ['year',         false],
};

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
    if (x.fileName === '*UP*') return -1;
    if (y.fileName === '*UP*') return 1;

    const orderFactor = decreasing ? -1 : 1;

    const compareValues = (a: any, b: any): number => {
      if (a < b) return 1 * orderFactor;
      if (a > b) return -1 * orderFactor;
      return 0;
    };

    switch (property) {
      case 'alphabetical':
        return compareValues(x.fileName.toLowerCase(), y.fileName.toLowerCase());

      case 'aspectRatio':
        return compareValues(x.width / x.height, y.width / y.height);

      case 'folderSize':
        // want non-folders to be considered "less than" a folder so give negative value by default.
        const xDisplay = (x.cleanName === '*FOLDER*') ? parseInt(x.fileSizeDisplay, 10) : -Infinity;
        const yDisplay = (y.cleanName === '*FOLDER*') ? parseInt(y.fileSizeDisplay, 10) : -Infinity;
        return compareValues(xDisplay, yDisplay);

      case 'hash':
        return compareValues(x.hash, y.hash);

      case 'stars':
        // handle `stars` case:  show properties that are not empty first
        const xStarsValue = x.stars === <StarRating>(<unknown>0.5) ? (decreasing ? Infinity : 0) : x.stars;
        const yStarsValue = y.stars === <StarRating>(<unknown>0.5) ? (decreasing ? Infinity : 0) : y.stars;
        return compareValues(xStarsValue, yStarsValue);

      case 'tags':
        return compareValues((x.tags || []).length, (y.tags || []).length);

      case 'year':
        // handle `year` case: show properties that are not empty first
        const xYearValue = x.year || (decreasing ? Infinity : 0);
        const yYearValue = y.year || (decreasing ? Infinity : 0);
        return compareValues(xYearValue, yYearValue);

      default:
        return compareValues(x[property], y[property]);
    }

  }

  /**
   * Return the same array randomized on next search
   * @param galleryArray
   * @param sortingType            - sorting method
   * @param forceSortUpdateTrigger - hack to force the sorting update
   * @param skip                   - whether to sort or return as is (needed for DUPLICATE SEARCH)
   */
  transform(
    galleryArray: ImageElement[],
    sortingType: SortType,
    forceSortUpdateTrigger: number | string, // changing input forces pipe to re-sort again
    skip: boolean
  ): ImageElement[] {

    if (skip) {
      return galleryArray;

    } else if (sortingType === 'random') {
      const currentIndex = (galleryArray[0]?.fileName === '*UP*' ? 1 : 0); // skip 'up button' if present
      return randomizeArray(galleryArray, currentIndex);

    } else if (sortingType === 'default') {
      return galleryArray; // sorting order set via `alphabetizeFinalArray` in `main-support.ts`

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
    }

    const sortMap = sortMapping[sortingType];

    if (sortMap) {
      return galleryArray.slice().sort((x: ImageElement, y: ImageElement): number =>
        this.sortFunctionLol(x, y, sortMap[0], sortMap[1])
      );
    }

    // default sorting
    return galleryArray.slice().sort((x: ImageElement, y: ImageElement): number => {
      return this.sortFunctionLol(x, y, 'index', true);
    });

  }
}
