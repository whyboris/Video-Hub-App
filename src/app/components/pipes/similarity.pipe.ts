import { Pipe, PipeTransform } from '@angular/core';

import { SimilarityService } from './similarity.service';

import { ImageElement } from '../common/final-object.interface';

@Pipe({
  name: 'similarityPipe'
})
export class SimilarityPipe implements PipeTransform {

  constructor(
    public similarityService: SimilarityService
  ) { }

  /**
   * Return only items that match search string
   * @param finalArray
   * @param render      whether to use the pipe or not
   * @param file        for what file to find similar files
   */
  transform(finalArray: ImageElement[], render: boolean, file: string): any {

    if (render && finalArray.length > 0) {

      this.similarityService.restartWith(file);

      finalArray.forEach((element, index) => {
        this.similarityService.processThisWord(index, element.cleanName);
      });

      const indexes: number[] = this.similarityService.getIndexesBySimilarity();

      return indexes.map((index: number) => {
        return finalArray[index];
      })

    }

    return finalArray;

  }

}
