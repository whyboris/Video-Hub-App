import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class SimilarityService {

  // map from index of element in array to num of elements in common with chosen file
  similarityMap: Map<number, number> = new Map();

  fileNameElements: string[];

  constructor() { }

  /**
   * Reset the map to empty and set the new filename to compare to
   */
  public restartWith(filename: string) {

    // lowercase everything, remove `the`, and fix double space if occurs due to `the` removal
    const cleanedFileName = filename.toLowerCase().replace(/the/g, '').replace(/  /g, ' ');
    this.fileNameElements = cleanedFileName.split(' ');
    console.log(this.fileNameElements);

    this.similarityMap = new Map();
  }

  public numInCommon(filename: string): number {

    const fileElements: string[] = filename.toLowerCase().split(' ');
    let numSimilar = 0;

    this.fileNameElements.forEach((element) => {
      if (fileElements.includes(element)) {
        numSimilar++;
      }
    });

    return numSimilar;
  }

  /**
   * Update map with {index => number of elements in common} pair for every new file
   * @param index     index within original array
   * @param filename  filename of file to compare to current filename
   */
  public processThisWord(index: number, filename: string): void {
    this.similarityMap.set(index, this.numInCommon(filename));
  }

  /**
   * Find filename with greatest number of similar words
   * remove it from the map,
   * and return its index
   */
  private getMostCommon() {
    let currNumSimilar: number = 0;
    let currBestMatch: number = 0;

    this.similarityMap.forEach((value, key) => {
      if (value > currNumSimilar) {
        currNumSimilar = value;
        currBestMatch = key;
      }
    });

    this.similarityMap.delete(currBestMatch);

    if (currNumSimilar > 1) {
      return currBestMatch;
    } else {
      return null;
    }

  }

  /**
   * Return in order from largest to fewest number of elements in common
   * must have 2 or more similar words to be returned
   */
  public getIndexesBySimilarity(): number[] {

    let stillSimilarFound = true;
    let tempIndex = 0;
    const finalResult = []; // array of objects

    while (stillSimilarFound) {
      const currMostCommon = this.getMostCommon();
      
      if (currMostCommon) {
        finalResult[tempIndex] = currMostCommon;
        tempIndex++;
      } else {
        stillSimilarFound = false;
      }   
    }

    return finalResult;
  }

}
