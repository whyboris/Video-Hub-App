import { Injectable } from '@angular/core';
import { ImageElement } from 'app/components/common/final-object.interface';

interface WordAndFreq {
  word: string;
  freq: number;
}

@Injectable()
export class TagsService {

  wordMap: Map<string, number> = new Map();

  potentialTwoWordMap: Map<string, number> = new Map();
  actualTwoWordMap: Map<string, number> = new Map();


  currentFrequency = 100;

  allOneWordTags: WordAndFreq[] = [];
  allOneWordTagsOnlyWords: string[] = [];

  finalTwoWordAray: WordAndFreq[] = [];

  finalArrayCleaned: string[] = [];

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
    const regex = /{|}|\(|\)|\[|\]|for|her|the|and|,/gi;
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

    this.currentFrequency = currLargestFreq;

    return {
      word: currLargestWord,
      freq: currLargestFreq
    }
  }

  /**
   * Computes the array 9 objects long with most frequent words
   * Creates `height` property, scaled between 8 and 22 proportionally
   * calls `.next` on BehaviorSubject
   */
  public computeOneWordTags(): WordAndFreq[] {
    const finalResult: WordAndFreq[] = []; // array of objects
    let iterator: number = 0;

    while (this.currentFrequency > 5) {
      if (this.wordMap.size > 0) {
        const currentMostFrequent = this.getMostFrequent();
        finalResult[iterator] = currentMostFrequent;
        this.allOneWordTagsOnlyWords.push(currentMostFrequent.word);
      } else {
        break;
      }
      iterator++;
    }

    this.allOneWordTags = this.alphabetizeResults(finalResult);

    return this.allOneWordTags;
  }

  public alphabetizeResults(unalphabetized: WordAndFreq[]): any {

    unalphabetized.sort((x: any, y: any) => {
      const first = x.word;
      const second = y.word;

      if (first < second) {
        return -1;
      } else {
        return 1;
      }

    });

    return unalphabetized;
  }


  public findTwoWords(singleWord: string): void {

    // console.log(singleWord);

    const filesContainingTheSingleWord: string[] = [];

    this.finalArrayCleaned.forEach((element) => {
      if (element.includes(singleWord)) {
        filesContainingTheSingleWord.push(element);
      }
    });

    // console.log(filesContainingTheSingleWord);

    filesContainingTheSingleWord.forEach((element) => {

      const words = element.split(' ');

      const numberIndex = words.findIndex((word) => word === singleWord);
      const nextWord = words[numberIndex + 1];

      // console.log(nextWord);

      if (this.allOneWordTagsOnlyWords.includes(nextWord)) {
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

      if (val < 5) {
        this.actualTwoWordMap.delete(key);
      } else {
        this.finalTwoWordAray.push({
          word: key,
          freq: val
        });
      }

    });

  }

  public getTwoWordCombos(): WordAndFreq[] {

    return this.finalTwoWordAray;

  }

  public cleanOneWordMapUsingTwoWordMap(): WordAndFreq[] {

    console.log("cleaning one word map");

    const finalCleanedLOL: WordAndFreq[] = [];

    const allWordsFromTwoWordArray: string[] = [];

    this.finalTwoWordAray.forEach((element) => {
      const twoWordArray: string[] = element.word.split(' ');
      twoWordArray.forEach((word: string) => {
        allWordsFromTwoWordArray.push(word);
      });
    });

    console.log(allWordsFromTwoWordArray);

    this.allOneWordTags.forEach((element) => {
      if (!allWordsFromTwoWordArray.includes(element.word)) {
        finalCleanedLOL.push(element);
      }
    });


    return finalCleanedLOL;





    // console.log("cleaning the one-word map");

    // this.finalTwoWordAray.forEach((element) => {

    //   const twoWordArray: string[] = element.word.split(' ');

    //   twoWordArray.forEach((singleWord: string) => {

    //     // BUG -- `sun` will match `sun` and `sunn` !!! need to remove if exact word found !!!
    //     // split strings into arrays of strings !!!

    //     const index = this.allOneWordTagsOnlyWords.indexOf(singleWord); // can occur more than once !!! bug !!!

    //     if (index > -1) {
    //       this.allOneWordTags.splice(index, 1);
    //       this.allOneWordTagsOnlyWords.splice(index, 1);
    //     }

    //   });

    // });

    // console.log(this.allOneWordTags);

    // return this.allOneWordTags;

  }



  public storeFinalArrayInMemory(finalArray: ImageElement[]): void {

    finalArray.forEach((element) => {
      this.finalArrayCleaned.push(element[2].toLowerCase());
    });

  }


  public computeTwoWordTags(): void {

    // console.log(this.allOneWordTags);
    // console.log(finalArray);

    this.allOneWordTags.forEach((element) => {
      this.findTwoWords(element.word.toLowerCase());
    });

    // this.findTwoWords(this.allOneWordTags[77].word.toLowerCase());


    this.cleanTwoWordMap();

    console.log(this.potentialTwoWordMap);
    console.log(this.actualTwoWordMap);

  }

}
