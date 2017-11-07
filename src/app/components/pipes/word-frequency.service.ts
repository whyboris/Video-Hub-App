import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class WordFrequencyService {

  wordMap: Map<string, number> = new Map();
  finalMapBehaviorSubject = new BehaviorSubject([]);

  ignore: string[] = [
    'and', 'the', 'to', 'a', 'of', 'for', 'as', 'i', 'with',
    'it', 'is', 'on', 'that', 'this', 'can', 'in', 'be', 'has',
    'if', '1', '2', '3', '4', '5', '6', '7', '8', '9', '', ' '
  ];

  constructor() { }

  /**
   * Reset the map to empty
   */
  public resetMap() {
    this.wordMap = new Map();
  }


  public addString(filename) {
    const wordArray = filename.split(' ');
    wordArray.forEach(word => {
      if (!this.ignore.includes(word.toLowerCase())) {
        this.addWord(word.toLowerCase());
      }
    });
  }

  /**
   * Populate the frequency map
   * @param word
   */
  private addWord(word) {
    if (this.wordMap.has(word)) {
      this.wordMap.set(word, this.wordMap.get(word) + 1);
    } else {
      this.wordMap.set(word, 1);
    }
  }

  /**
   * Remove all elements with 3 or fewer occurences
   */
  public cleanMap() {
    this.wordMap.forEach((value, key) => {
      if (value < 3) {
        this.wordMap.delete(key);
      }
    });
    console.log(this.wordMap);
  }

  /**
   * Get most frequent word from the map,
   * remove it from the map,
   * and return it with its frequency as an object
   */
  private getMostFrequent() {
    let currLargestFreq = 0;
    let currLargestWord = '';

    this.wordMap.forEach((value, key) => {
      if (value > currLargestFreq) {
        currLargestFreq = value;
        currLargestWord = key;
      }
    });

    this.wordMap.delete(currLargestWord);

    return {
      word: currLargestWord,
      freq: currLargestFreq
    }
  }

  /**
   * Return an array 9 objects long with most frequent words
   */
  public getFrequencyArray() {
    const finalResult = []; // array of objects
    for (let i = 0; i < 9; i++) {
      if (this.wordMap.size > 0) {
        finalResult[i] = this.getMostFrequent();
      } else {
        finalResult[i] = {
          word: null,
          freq: null
        }
      }
    }
    console.log('behavior subject updated');
    this.finalMapBehaviorSubject.next(finalResult);
    return finalResult;
  }

}
