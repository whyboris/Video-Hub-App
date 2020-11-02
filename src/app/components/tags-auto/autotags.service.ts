import { Injectable } from '@angular/core';

import { AutoTagsSaveService } from './tags-save.service';

import { ImageElement } from '../../../../interfaces/final-object.interface';

export interface WordAndFreq {
  word: string;
  freq: number;
  prefix: string; // filled in inside alphabetPrefixPipe
}

// Used to strip out: all non-words, e.g. {}()[]-,.
export const autoFileTagsRegex: RegExp = /\b(\w+)\b/g;

@Injectable()
export class AutoTagsService {

  oneWordFreqMap: Map<string, number> = new Map();
  twoWordFreqMap: Map<string, number> = new Map();

  onlyFileNames: string[] = [];         // array with just clean file names toLowerCase

  minWordLength: number = 3; // minimum, inclusive 3 => 3 letters or more for a word to be considered
  oneWordMinInstances: number = 2; // runs after 2-word-instances created
  twoWordMinInstances: number = 2; // items show up if 3 or more exist

  cachedHub: string;

  constructor(
    public autoTagsSaveService: AutoTagsSaveService
  ) { }

  /**
   * Go through the whole process of generating the 1-word and 2-word arrays
   * @param finalArray - ImageElement[] of all files from app
   */
  public generateAllTags(finalArray: ImageElement[], hubName: string): Promise<boolean> {

    return new Promise((res, rej) => {

      if (this.cachedHub !== hubName) {

        this.resetState();

        this.cachedHub = hubName;

        // When hub has thousands of videos, the startup may freeze the UI
        // setTimeout decreases the freezing
        setTimeout(() => {
          this.storeFinalArrayInMemory(finalArray);

          this.cleanOneWordFreqMap(); // only to have items Math.max(oneWordMinInstances, twoWordMinInstances)

          const t2 = performance.now();

          // THIS TAKES 4 SECONDS
          const potentialTwoWordMap: Map<string, number> = new Map();

          this.oneWordFreqMap.forEach((val: number, key: string) => {
            this.findTwoWords(potentialTwoWordMap, key);
          });

          const t3 = performance.now();
          console.log("long 1 " + (t3 - t2) + " milliseconds."); // 4 seconds

          // THIS TAKES 4 SECONDS before `.then` is executed
          this.doWebWorkerProcessing(potentialTwoWordMap).then((data) => {
            console.log('WEB WORKER FINISHED');

            this.twoWordFreqMap = data;

            this.cleanTwoWordMapBelowCutoff();

            this.cleanOneWordMapUsingTwoWordMap();

            this.trimMap(this.oneWordFreqMap, 5);
            this.trimMap(this.twoWordFreqMap, 3);

            this.loadAddTags();
            this.loadRemoveTags();

            res(true);

          });

        }, 1);

      } else {
        res(true);
      }

    });

  }

  /**
   * Outsource `cleanTwoWordMap` process to the web worker to prevent locking up the UI
   * @param potentialTwoWordMap
   */
  private doWebWorkerProcessing(potentialTwoWordMap): Promise<Map<string, number>> {
    return new Promise((resolve, reject) => {
      if (typeof Worker !== 'undefined') {
        const worker = new Worker('./tags.worker', { type: 'module' });

        worker.onmessage = (message) => {
          resolve(message.data);
        };

        worker.postMessage({
          potentialTwoWordMap: potentialTwoWordMap,
          onlyFileNames: this.onlyFileNames,
        });

      } else {
        console.log('ERROR !!!!!!!!!!!!!!! WORKER CAN NOT START !!!');
      }
    });
  }

  /**
   * Reset all variables so we can recalculate things for the new hub
   */
  private resetState(): void {
    this.oneWordFreqMap = new Map();
    this.twoWordFreqMap = new Map();
    this.onlyFileNames = [];
  }

  /**
   * Generate `onlyFileNames` which is string[] of just file names in lower case
   * Calls method that populates the `wordMap`
   * @param finalArray - the whole initial ImageElement[]
   */
  private storeFinalArrayInMemory(finalArray: ImageElement[]): void {
    finalArray.forEach((element) => {
      const cleanedFileName: string = (element.cleanName.toLowerCase().match(autoFileTagsRegex) || []).join(' ');

      this.onlyFileNames.push(cleanedFileName);
      this.addString(cleanedFileName);
    });
  }

  /**
   * Add each word from the file name to the wordMap via the `addWord` method
   * Ignore all words with 3 or fewer characters
   * Strip out all parantheses, brackets, and a few other words
   * @param filename
   */
  private addString(filename: string): void {
    const wordArray = filename.split(' ');
    wordArray.forEach(word => {
      if (word.length >= this.minWordLength) {
        this.addWord(word);
      }
    });
  }

  /**
   * Populate the frequency map
   * @param word
   */
  private addWord(word: string): void {
    if (this.oneWordFreqMap.has(word)) {
      this.oneWordFreqMap.set(word, this.oneWordFreqMap.get(word) + 1);
    } else {
      this.oneWordFreqMap.set(word, 1);
    }
  }

  /**
   * Remove all elements with 3 or fewer occurences
   */
  private cleanOneWordFreqMap(): void {
    this.oneWordFreqMap.forEach((value, key) => {
      if (value <= Math.max(this.twoWordMinInstances, this.oneWordMinInstances)) {
        this.oneWordFreqMap.delete(key);
      }
    });
  }

  /**
   * Given a single word from tag list, look up following word
   * If on the list, add the two-word string to `potentialTwoWordMap`
   * @param singleWord
   */
  private findTwoWords(potentialTwoWordMap: Map<string, number>, singleWord: string): void {

    const filesContainingTheSingleWord: string[] = [];

    this.onlyFileNames.forEach((fileName) => {
      if (fileName.includes(singleWord)) {
        filesContainingTheSingleWord.push(fileName);
      }
    });

    filesContainingTheSingleWord.forEach((fileName) => {

      const filenameWordArray: string[] = fileName.split(' ');

      const numberIndex: number = filenameWordArray.indexOf(singleWord);
      const nextWord: string = filenameWordArray[numberIndex + 1];

      if (this.oneWordFreqMap.has(nextWord)) {
        const twoWordPair = singleWord + ' ' + nextWord;

        let currentOccurrences = potentialTwoWordMap.get(twoWordPair) || 0;
        currentOccurrences++;

        potentialTwoWordMap.set(twoWordPair, currentOccurrences);
      }

    });
  }

  /**
   * Remove any elements from the map below the cutoff
   */
  private cleanTwoWordMapBelowCutoff(): void {
    this.twoWordFreqMap.forEach((val: number, key: string) => {
      if (val <= this.twoWordMinInstances) {
        this.twoWordFreqMap.delete(key);
      }
    });
  }

  /**
   * clean up the one word map to not include anything that is in the list of two-word tags
   */
  private cleanOneWordMapUsingTwoWordMap(): void {

    const allWordsFromTwoWordArray: string[] = [];

    // fill in `allWordsFromTwoWordArray` based on what is currently in the `twoWordsFreqMap`
    this.twoWordFreqMap.forEach((val: number, key: string) => {
      const twoWords: string[] = key.split(' ');
      twoWords.forEach((word: string) => {
        allWordsFromTwoWordArray.push(word);
      });
    });

    this.oneWordFreqMap.forEach((val: number, key: string) => {
      if (allWordsFromTwoWordArray.includes(key)) {
        this.oneWordFreqMap.delete(key);
      }
    });
  }

  /**
   * Convert a Map<string, number> to WordAndFreq[] containing objects { word: string, freq: number }
   * @param someMap
   * @param minCutoff -- minimum number of elements a tag must have before it is returned
   */
  private convertMapToWordAndFreqArray(someMap: Map<string, number>): WordAndFreq[] {
    const returnArray: WordAndFreq[] = [];

    someMap.forEach((val: number, key: string) => {
      returnArray.push({
        word: key,
        freq: val,
        prefix: undefined, // to be filled in by alphabetPrefixPipe
      });
    });

    return returnArray;
  }

  /**
   * Return alphabetized the one-word tags with their frequencies
   */
  public getOneWordTags(): WordAndFreq[] {
    return this.alphabetizeResults(this.convertMapToWordAndFreqArray(this.oneWordFreqMap));
  }

  /**
   * Return alphabetized the two-word tags with their freqeuencies
   */
  public getTwoWordTags(): WordAndFreq[] {
    return this.alphabetizeResults(this.convertMapToWordAndFreqArray(this.twoWordFreqMap));
  }

  /**
   * Trim a given map to only have elements with `minCutoff` instances
   * @param givenMap
   * @param minCutoff
   */
  private trimMap(givenMap: Map<string, number>, minCutoff: number): void {
    givenMap.forEach((val: number, key: string) => {
      if (val < minCutoff) {
        givenMap.delete(key);
      }
    });
  }

  /**
   * Alphabetize any WordAndFreq[]
   * @param wordAndFreq
   */
  private alphabetizeResults(wordAndFreq: WordAndFreq[]): any {
    wordAndFreq.sort((x: any, y: any) => {
      const first = x.word;
      const second = y.word;

      if (first < second) {
        return -1;
      } else {
        return 1;
      }
    });

    return wordAndFreq;
  }

  /**
   * Decide how many files contain current query
   * used by tag-match.pipe and tags.component
   * @param query
   */
  public findMatches(query: string): number {
    return this.onlyFileNames.filter((element) => {
      return element.toLowerCase().includes(query.toLowerCase());
    }).length;
  }

  /**
   * Attempt to add tag to the list
   * @param tag
   */
  public canWeAdd(tag: string): boolean {
    if (tag.includes(' ')) {
      if (this.twoWordFreqMap.has(tag)) {
        return false;
      } else {
        this.twoWordFreqMap.set(tag, this.findMatches(tag));
        return true;
      }
    } else {
      if (this.oneWordFreqMap.has(tag)) {
        return false;
      } else {
        this.oneWordFreqMap.set(tag, this.findMatches(tag));
        return true;
      }
    }
  }

  /**
   * Add to the map all tags present in the `addTags` array
   * from the `autoTagsSaveService`
   */
  private loadAddTags(): void {
    const allAddTags = this.autoTagsSaveService.getAddTags();

    allAddTags.forEach((tag) => {
      if (tag.includes(' ')) {
        this.twoWordFreqMap.set(tag, this.findMatches(tag));
      } else {
        this.oneWordFreqMap.set(tag, this.findMatches(tag));
      }
    });

  }

  /**
   * Remove from map any tags present in the `removeTags` array
   * from the `autoTagsSaveService`
   */
  private loadRemoveTags(): void {
    const allRemoveTags = this.autoTagsSaveService.getRemoveTags();

    allRemoveTags.forEach((tag) => {
      if (tag.includes(' ')) {
        this.twoWordFreqMap.delete(tag);
      } else {
        this.oneWordFreqMap.delete(tag);
      }
    });

  }


  /**
   * Remove a tag from the map
   * @param tag
   */
  public removeTag(tag: string): void {
    if (tag.includes(' ')) {
      this.twoWordFreqMap.delete(tag);
    } else {
      this.oneWordFreqMap.delete(tag);
    }
  }


}
