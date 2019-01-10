import { Pipe, PipeTransform } from '@angular/core';

import { WordFrequencyService } from './word-frequency.service';

@Pipe({
  name: 'wordFrequencyPipe'
})
export class WordFrequencyPipe implements PipeTransform {

  constructor(
    public wordFrequencyService: WordFrequencyService
  ) { }

  /**
   * Return only items that match search string
   * @param finalArray
   * @param render       whether to calculate the wordFrequency
   * @param numberOfTags number of tags to generate for the word cloud
   */
  transform(finalArray: any, render: boolean, numberOfTags: number): any {

    if (render && finalArray.length > 0) {

      // console.log('Word frequency pipe RUNNING !!!');

      this.wordFrequencyService.resetMap();

      finalArray.forEach(element => {
        this.wordFrequencyService.addString(element.cleanName);
      });

      this.wordFrequencyService.cleanMap();

      this.wordFrequencyService.computeFrequencyArray(finalArray.length, numberOfTags);
    }

    return finalArray;

  }

}
