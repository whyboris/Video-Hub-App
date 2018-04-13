import { Pipe, PipeTransform } from '@angular/core';

import { LevenshteinService } from './levenshtein.service';

import { FileSearchPipe } from './file-search.pipe';

@Pipe({
  name: 'levenshteinPipe'
})
export class LevenshteinPipe implements PipeTransform {

  constructor(
    public fileSearch: FileSearchPipe,
    public levenshteinService: LevenshteinService
  ) { }

  /**
   * Return only items that match search string
   * @param finalArray
   * @param render      whether to calculate the wordFrequency
   */
  transform(finalArray: any, render: boolean, file: string): any {

    // console.log(file);

    if (render && finalArray.length > 0) {

      const fileSplitUp = file.split(' ');

      // console.log(fileSplitUp);
      console.log('FULL ARRAY:');
      console.log(finalArray);

      const trimmed = this.fileSearch.transform(finalArray, fileSplitUp, true, true, true, false);

      console.log('TRIMMED:')
      console.log(trimmed);

      console.log('LEVENSHTEIN RUNNING !!!');

      this.levenshteinService.restartWith(file);

      trimmed.forEach((element, index) => {
        this.levenshteinService.processThisWord(index, element[2]);
      });

      const indexes: number[] = this.levenshteinService.getIndexesByLevDistance();

      return indexes.map((index: number) => {
        return trimmed[index];
      })

    }

    return finalArray;

  }

}
