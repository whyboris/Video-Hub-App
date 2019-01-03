import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

interface WordFreqAndHeight {
  word: string;
  freq: number;
  height?: number;
}

@Injectable()
export class WordFrequencyService {

  wordMap: Map<string, number> = new Map();
  finalMapBehaviorSubject = new BehaviorSubject([]);

  constructor() { }

  /**
   * Reset the map to empty
   */
  public resetMap() {
    this.wordMap = new Map();
  }

  /**
   * Add each word from the file name to the wordMap via the `addWord` method
   * Ignore all words less than 2 characters long
   * Strip out all parantheses, brackets, and a few other words
   * @param filename
   */
  public addString(filename: string): void {
    // Strip out: {}()[] as well as 'for', 'her', 'the', 'and', & ','
    const regex = /{|}|\(|\)|\[|\]|\b(for|her|the|and)\b|,/gi;
    filename = filename.replace(regex, '');
    const wordArray = filename.split(' ');
    wordArray.forEach(word => {
      if (!(word.length < 3)) {
        this.addWord(word.toLowerCase());
      }
    });
  }

  /**
   * Populate the frequency map
   * @param word
   */
  private addWord(word: string): void {
    if (this.wordMap.has(word)) {
      this.wordMap.set(word, this.wordMap.get(word) + 1);
    } else {
      this.wordMap.set(word, 1);
    }
  }

  /**
   * Remove all elements with 3 or fewer occurences
   */
  public cleanMap(): void {
    this.wordMap.forEach((value, key) => {
      if (value < 3) {
        this.wordMap.delete(key);
      }
    });
  }

  /**
   * Get most frequent word from the map,
   * remove it from the map,
   * and return it with its frequency as an object
   */
  private getMostFrequent(total: number) {
    let currLargestFreq = 0;
    let currLargestWord = '';

    this.wordMap.forEach((value, key) => {
      if (value > currLargestFreq && value < total) {
        currLargestFreq = value;
        currLargestWord = key;
      }
    });

    this.wordMap.delete(currLargestWord);

    return {
      word: currLargestWord,
      freq: currLargestFreq
    };
  }

  /**
   * Computes the array 9 objects long with most frequent words
   * Creates `height` property, scaled between 8 and 22 proportionally
   * calls `.next` on BehaviorSubject
   * @param total: total number of files displayed
   **/
  public computeFrequencyArray(total: number): void {
    const finalResult: WordFreqAndHeight[] = []; // array of objects
    for (let i = 0; i < 9; i++) {
      if (this.wordMap.size > 0) {
        finalResult[i] = this.getMostFrequent(total);
      } else {
        finalResult[i] = {
          word: null,
          freq: null
        };
      }
    }

    if (finalResult.length > 0) {
      const largest = finalResult[0].freq;
      const smallest = finalResult[finalResult.length - 1].freq;
      const scaleFactor = 14 / (largest - smallest);
      // 14 is the range between 8 and 22 -- smallest and largest I'd like text to be (px).

      finalResult.forEach((element) => {
        element.height = 8 + (element.freq - smallest) * scaleFactor;
      });
    }

    // console.log(finalResult);
    this.finalMapBehaviorSubject.next(finalResult);
  }

}
