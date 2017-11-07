import { Injectable } from '@angular/core';

@Injectable()
export class WordFrequencyService {

  wordMap: Map<string, number> = new Map();

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
      this.addWord(word);
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
    return finalResult;
  }

}
