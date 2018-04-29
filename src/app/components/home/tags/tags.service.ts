import { Injectable } from '@angular/core';

import { ImageElement } from 'app/components/common/final-object.interface';

export interface WordAndFreq {
  word: string;
  freq: number;
}

@Injectable()
export class TagsService {

  actualTwoWordMap: Map<string, number> = new Map();
  potentialTwoWordMap: Map<string, number> = new Map();
  wordMap: Map<string, number> = new Map(); // frequency map of all the words in file names

  finalArrayCleaned: string[] = [];         // array with just clean file names toLowerCase
  finalTwoWordAray: WordAndFreq[] = [];

  oneWordAndFreq: WordAndFreq[] = [];       // all one-word tags

  oneWordMinInstances: number = 3; // NOT YET IMPLEMENTED -- do after 2-word-instances created !!!

  twoWordMinInstances: number = 3; // minimum number of elements before tag not reported

  minWordLength: number = 3; // minimum word length to be considered a potential tag

  tempFinalFinal: WordAndFreq[];

  constructor() { }

  /**
   * Go through the whole process of generating the 1-word and 2-word arrays
   * @param finalArray - ImageElement[] of all files from app
   */
  public generateAllTags(finalArray: ImageElement[]): void {

    this.storeFinalArrayInMemory(finalArray);

    this.cleanMap(); // also creates `oneWordAndFreq`

    this.oneWordAndFreq.forEach((element) => {
      this.findTwoWords(element.word);
    });

    this.cleanTwoWordMap();

    this.cleanOneWordMapUsingTwoWordMap(); // updates `tempFinalFinal`
  }

  /**
   * Generate `finalArrayCleaned` which is string[] of just file names in lower case
   * Calls method that populates the `wordMap`
   * @param finalArray - the whole initial ImageElement[]
   */
  public storeFinalArrayInMemory(finalArray: ImageElement[]): void {
    finalArray.forEach((element) => {
      this.finalArrayCleaned.push(element[2].toLowerCase());
      this.addString(element[2].toLowerCase());
    });
  }

  /**
   * Add each word from the file name to the wordMap via the `addWord` method
   * Ignore all words with 3 or fewer characters
   * Strip out all parantheses, brackets, and a few other words
   * @param filename
   */
  public addString(filename: string): void {
    // Strip out: {}()[] as well as 'for', 'her', 'the', 'and', & ','
    const regex = /{|}|\(|\)|\[|\]|for|her|the|and|,/gi;
    filename = filename.replace(regex, '');
    const wordArray = filename.split(' ');
    wordArray.forEach(word => {
      if (!(word.length <= this.minWordLength)) {
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
   * Remove all elements with 3 or fewer occurences
   * Creates the `oneWordAndFreq` WordAndFreq[]
   */
  public cleanMap(): void {
    this.wordMap.forEach((value, key) => {
      if (value <= this.twoWordMinInstances) {
        this.wordMap.delete(key);
      } else {
        this.oneWordAndFreq.push({
          word: key,
          freq: value
        });
      }
    });
  }

  /**
   * Given a single word from tag list, look up following word
   * If on the list, add two word to `potentialTwoWordMap`
   * @param singleWord
   */
  public findTwoWords(singleWord: string): void {

    const filesContainingTheSingleWord: string[] = [];

    this.finalArrayCleaned.forEach((fileName) => {
      if (fileName.includes(singleWord)) {
        filesContainingTheSingleWord.push(fileName);
      }
    });

    filesContainingTheSingleWord.forEach((fileName) => {

      const words = fileName.split(' ');

      const numberIndex = words.findIndex((word) => word === singleWord);
      const nextWord = words[numberIndex + 1];

      if (this.wordMap.has(nextWord)) {
        const twoWordPair = singleWord + ' ' + nextWord;
        // console.log(twoWordPair);
        let currentOccurrences = this.potentialTwoWordMap.get(twoWordPair) || 0;
        currentOccurrences++;

        this.potentialTwoWordMap.set(twoWordPair, currentOccurrences);
        // at this point the map contains a lot of incorrect elements like `fox legalporno`
      }

    });
  }


  public cleanTwoWordMap(): void {

    this.potentialTwoWordMap.forEach((val: number, key: string, map: any) => {

      let newCounter: number = 0;

      for (let i = 0; i < this.finalArrayCleaned.length; i++) {
        if (this.finalArrayCleaned[i].includes(key)) {
          newCounter++;
          this.actualTwoWordMap.set(key, newCounter);
        }
      }
    });

    this.actualTwoWordMap.forEach((val: number, key: string, map: any) => {

      if (val <= this.twoWordMinInstances) { // not responsive?
        this.actualTwoWordMap.delete(key);
      } else {
        this.finalTwoWordAray.push({
          word: key,
          freq: val
        });
      }

    });

  }

  public cleanOneWordMapUsingTwoWordMap(): void {

    console.log("cleaning one word map");

    const finalCleanedLOL: WordAndFreq[] = [];

    const allWordsFromTwoWordArray: string[] = [];

    this.finalTwoWordAray.forEach((element) => {
      const twoWordArray: string[] = element.word.split(' ');
      twoWordArray.forEach((word: string) => {
        allWordsFromTwoWordArray.push(word);
      });
    });

    // console.log(allWordsFromTwoWordArray);

    this.oneWordAndFreq.forEach((element) => {
      if (!allWordsFromTwoWordArray.includes(element.word)) {
        finalCleanedLOL.push(element);
      }
    });

    this.tempFinalFinal = finalCleanedLOL;
  }


  public getTwoWordCombos(): WordAndFreq[] {
    return this.alphabetizeResults(this.finalTwoWordAray);
  }

  public getOneWordTags(): WordAndFreq[] {
    return this.alphabetizeResults(this.tempFinalFinal);
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

}
