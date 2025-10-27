import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { autoFileTagsRegex } from '../components/tags-auto/autotags.service';

import { AutoTagsSaveService } from '../components/tags-auto/tags-save.service';

export interface WordFreqAndHeight {
  word: string;
  freq: number;
  height?: number;
}

@Injectable()
export class WordFrequencyService {

  wordMap: Map<string, number> = new Map();
  finalMapBehaviorSubject: BehaviorSubject<WordFreqAndHeight[]> = new BehaviorSubject([]);

  constructor(
    private autoTagsSaveService: AutoTagsSaveService
  ) { }

  /**
   * Reset the map to empty
   */
  public resetMap(): void {
    this.wordMap = new Map();
  }

  /**
   * Add each word from the file name to the wordMap via the `addWord` method
   * Ignore all words less than 3 characters long and any words in the hiddenTags list
   * Strip out all parantheses, brackets, and a few other words
   * @param filename
   */
  public addString(filename: string): void {
    const hiddenTags = this.autoTagsSaveService.getRemoveTags();
    const wordArray: string[] = filename.toLowerCase().match(autoFileTagsRegex) || [];
    wordArray.forEach(word => {
      if (word.length >= 3 && !hiddenTags.includes(word)) {
        this.addWord(word);
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
   * Remove all elements with 2 or fewer occurences
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
  private getMostFrequent(total: number): WordFreqAndHeight {
    let currLargestFreq = 0;
    let currLargestWord = '';

    this.wordMap.forEach((value, key) => {
      if (value > currLargestFreq && value <= total) {
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
   * Computes the array `numberOfTags` objects long with most frequent words
   * Creates `height` property, scaled between 12 and 22 proportionally
   * calls `.next` on BehaviorSubject
   * @param total: total number of files displayed
   **/
  public computeFrequencyArray(total: number, numberOfTags: number): void {
    const finalResult: WordFreqAndHeight[] = [];
    for (let i = 0; i < numberOfTags; i++) {
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
      const scaleFactor = 10 / (largest - smallest);
      // 14 is the range between 12 and 22 -- smallest and largest I'd like text to be (px).

      finalResult.forEach((element) => {
        element.height = 12 + (element.freq - smallest) * scaleFactor;
      });
    }

    this.finalMapBehaviorSubject.next(finalResult);
  }

}
