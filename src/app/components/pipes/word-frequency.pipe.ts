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
   * @param smthing    useless item
   */
  transform(finalArray: any, smthng?: any): any {

    console.log('Word frequency pipe RUNNING !!!');

    this.wordFrequencyService.resetMap();

    finalArray.forEach(element => {
      this.wordFrequencyService.addString(element[2]);
    });

    this.wordFrequencyService.cleanMap();

    console.log(this.wordFrequencyService.getFrequencyArray());

    return finalArray;

  }

}
