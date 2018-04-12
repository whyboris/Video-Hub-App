import { Pipe, PipeTransform } from '@angular/core';

import { LevenshteinService } from './levenshtein.service';

@Pipe({
  name: 'levenshteinPipe'
})
export class LevenshteinPipe implements PipeTransform {

  constructor(
    public levenshteinService: LevenshteinService
  ) { }

  /**
   * Return only items that match search string
   * @param finalArray
   * @param render      whether to calculate the wordFrequency
   */
  transform(finalArray: any, render: boolean, file: string): any {

    console.log(file);

    if (render && finalArray.length > 0) {

      console.log('LEVENSHTEIN RUNNING !!!');

      this.levenshteinService.restartWith(file);

      finalArray.forEach((element, index) => {
        this.levenshteinService.processThisWord(index, element[2]);
      });

      const indexes: number[] = this.levenshteinService.getIndexesByLevDistance();

      return indexes.map((index: number) => {
        return finalArray[index];
      })

    }

    return finalArray;

  }

}
