import type { PipeTransform } from "@angular/core";
import { Pipe } from "@angular/core";
import type {
  ImageElement,
  StarRating,
} from "../../../interfaces/final-object.interface";
import { randomizeArray } from "../../../node/utility";
import { orderBy } from "natural-orderby";

export type SortType =
  | "default"
  | "alphabetAsc"
  | "alphabetAsc2"
  | "alphabetDesc"
  | "alphabetDesc2"
  | "aspectRatioAsc"
  | "aspectRatioDesc"
  | "createdAsc"
  | "createdDesc"
  | "folderSizeAsc"
  | "folderSizeDesc"
  | "fpsAsc"
  | "fpsDesc"
  | "hash" // only used by the duplicateFinderPipe
  | "lastPlayedAsc"
  | "lastPlayedDesc"
  | "modifiedAsc"
  | "modifiedDesc"
  | "random"
  | "sizeAsc"
  | "sizeDesc"
  | "starAsc"
  | "starDesc"
  | "tagsAsc"
  | "tagsDesc"
  | "timeAsc"
  | "timeDesc"
  | "timesPlayedAsc"
  | "timesPlayedDesc"
  | "yearAsc"
  | "yearDesc";

@Pipe({
  name: "sortingPipe",
})
export class SortingPipe implements PipeTransform {
  /**
   * Helper function for sorting. Always moves the "up folder" to the top.
   * Sorts everything else according to the property.
   *
   * @param x - First ImageElement to compare.
   * @param y - Second ImageElement to compare.
   * @param property - Property based on which sorting will be done.
   * @param decreasing - Boolean to indicate whether sorting should be ascending or descending.
   * @returns {number} - Returns -1, 0, or 1 based on the comparison result.
   */
  sortFunctionLol(
    x: ImageElement,
    y: ImageElement,
    property: string,
    decreasing: boolean
  ): number {
    const orderFactor = decreasing ? -1 : 1;

    // up button first
    if (x.fileName === "*UP*") return -1;
    if (y.fileName === "*UP*") return 1;

    const compareValues = (a: any, b: any): number => {
      if (a < b) return -1 * orderFactor;
      if (a > b) return 1 * orderFactor;
      return 0;
    };

    switch (property) {
      case "alphabetical":
        return compareValues(
          x.fileName.toLowerCase(),
          y.fileName.toLowerCase()
        );

      case "tags":
        return compareValues((x.tags || []).length, (y.tags || []).length);

      case "hash":
        return compareValues(x.hash, y.hash);

      case "year":
        const xYearValue = x.year || (decreasing ? Infinity : 0);
        const yYearValue = y.year || (decreasing ? Infinity : 0);
        return compareValues(xYearValue, yYearValue);

      case "stars":
        const xStarsValue =
          x.stars === <StarRating>(<unknown>0.5)
            ? decreasing
              ? Infinity
              : 0
            : x.stars;
        const yStarsValue =
          y.stars === <StarRating>(<unknown>0.5)
            ? decreasing
              ? Infinity
              : 0
            : y.stars;
        return compareValues(xStarsValue, yStarsValue);

      case "aspectRatio":
        const xAspectRatio = x.width / x.height;
        const yAspectRatio = y.width / y.height;
        return compareValues(xAspectRatio, yAspectRatio);

      case "folderSize":
        const getValue = (el: ImageElement): number => {
          if (el.cleanName === "*FOLDER*")
            return parseInt(el.fileSizeDisplay, 10);
          return -Infinity;
        };
        return compareValues(getValue(x), getValue(y));

      default:
        return compareValues(x[property], y[property]);
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
    }

    if (sortingType === "random") {
      const currentIndex = galleryArray[0]?.fileName === "*UP*" ? 1 : 0;
      return randomizeArray(galleryArray, currentIndex);
    }

    if (sortingType === "default") {
      return galleryArray;
    }

    const sortMapping: Record<string, [string, boolean]> = {
      alphabetAsc: ["alphabetical", true],
      alphabetDesc: ["alphabetical", false],
      sizeAsc: ["fileSize", true],
      sizeDesc: ["fileSize", false],
      // ... add all your other types here ...
    };

    const sortOrder = sortMapping[sortingType];
    if (sortOrder) {
      return galleryArray
        .slice()
        .sort((x: ImageElement, y: ImageElement) =>
          this.sortFunctionLol(x, y, sortOrder[0], sortOrder[1])
        );
    }

    // For custom sorts like alphabetAsc2 and alphabetDesc2
    const customSortFunctions: Record<
      string,
      (arr: ImageElement[]) => ImageElement[]
    > = {
      alphabetAsc2: (arr) => {
        if (arr.length && arr[0].fileName === "*UP*") {
          const tempGallery: ImageElement[] = arr.slice();
          const tempUp: ImageElement = tempGallery.shift();
          return [tempUp, ...orderBy(tempGallery, "fileName", "asc")];
        }
        return orderBy(arr, "fileName", "asc");
      },
      // ... add similar functions for other custom sorts ...
    };

    const customSort = customSortFunctions[sortingType];
    if (customSort) {
      return customSort(galleryArray);
    }

    // If no known sorting type is matched, return default sort
    return galleryArray
      .slice()
      .sort((x: ImageElement, y: ImageElement) =>
        this.sortFunctionLol(x, y, "index", true)
      );
  }
}
