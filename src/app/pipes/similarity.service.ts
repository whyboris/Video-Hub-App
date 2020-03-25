import { Injectable } from '@angular/core';

@Injectable()
export class SimilarityService {

  // map from index of element in array to num of elements in common with chosen file
  similarityMap: Map<number, number> = new Map();

  fileNameElements: string[]; // array of words in the original file name

  constructor() { }

  /**
   * Reset the map to empty and set the new filename to compare to
   */
  public restartWith(filename: string): void {
    // lowercase everything, remove `the`, ` - `, and trim space if `the` was the first word
    const cleanedFileName = filename.toLowerCase().replace(/the /g, ' ').replace(/ - /g, ' ').trim();
    this.fileNameElements = cleanedFileName.split(' ');
    this.similarityMap = new Map();
  }

  /**
   * Return how many words this filename has in common with original file (`fileNameElements`)
   * @param filename filename to compare to `fileNameElements`
   */
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
  private getMostCommon(): number {
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
   * maximum of 25 returned
   */
  public getIndexesBySimilarity(): number[] {

    let stillSimilarFound = true;
    let tempIndex = 0;
    const finalResult = []; // array of objects

    while (stillSimilarFound) {
      const currMostCommon = this.getMostCommon();

      if (currMostCommon !== null) {
        finalResult[tempIndex] = currMostCommon;
        tempIndex++;
      } else {
        stillSimilarFound = false;
      }

      if (tempIndex > 24) { // HARD CODED 25 limit
        stillSimilarFound = false; // end the while loop
      }
    }

    return finalResult;
  }

}
