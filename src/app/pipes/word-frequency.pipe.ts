import { Pipe, PipeTransform } from '@angular/core';

import { WordFrequencyService } from './word-frequency.service';

import { ImageElement } from '../../../interfaces/final-object.interface';

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
   * @param render              whether to calculate the wordFrequency
   * @param showManualTags      boolean
   * @param showAutoFileTags    boolean
   * @param showAutoFolderTags  boolean
   */
  transform(
    finalArray: ImageElement[],
    render: boolean,
    showManualTags: boolean,
    showAutoFileTags: boolean,
    showAutoFolderTags: boolean
  ): ImageElement[] {

    if (render && finalArray.length > 0) {

      // console.log('Word frequency pipe RUNNING !!!');

      this.wordFrequencyService.resetMap();

      finalArray.forEach(element => {
        if (showManualTags && element.tags) {
          this.wordFrequencyService.addString(element.tags.join(' '));
        }
        if (showAutoFileTags) {
          this.wordFrequencyService.addString(element.cleanName);
        }
        if (showAutoFolderTags) {
          this.wordFrequencyService.addString(element.partialPath.replace(/(\/)/g, ' '));
        }
      });

      // this.wordFrequencyService.cleanMap();

      this.wordFrequencyService.computeFrequencyArray(finalArray.length, 165);
    }

    return finalArray;

  }

}
