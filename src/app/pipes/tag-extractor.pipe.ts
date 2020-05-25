import { Pipe, PipeTransform } from '@angular/core';

import { WordFrequencyService } from './word-frequency.service';
import { ManualTagsService } from '../components/tags-manual/manual-tags.service';

import { ImageElement } from '../../../interfaces/final-object.interface';

@Pipe({
  name: 'tagExtractorPipe'
})
export class TagExtractorPipe implements PipeTransform {

  constructor(
    public wordFrequencyService: WordFrequencyService,
    public manualTagsService: ManualTagsService
  ) { }

  /**
   * Does not actually transform the input Array.
   * Instead, Iterates through the ImageElement[] to take action on tags
   * Returns identical ImageElement[] as input
   * @param finalArray
   * @param render              whether to calculate the wordFrequency
   * @param numberOfTags        number of tags to generate for the word cloud
   * @param showManualTags      boolean
   * @param showAutoFileTags    boolean
   * @param showAutoFolderTags  boolean
   */
  transform(
    finalArray: ImageElement[],
    render: boolean,
    numberOfTags: number,
    showManualTags: boolean,
    showAutoFileTags: boolean,
    showAutoFolderTags: boolean
  ): ImageElement[] {

    if (render && finalArray.length > 0) {

      // console.log('Tag Extractor pipe RUNNING !!!');

      this.wordFrequencyService.resetMap();
      this.manualTagsService.removeAllTags();

      finalArray.forEach(element => {
        if (showManualTags && element.tags) {
          this.wordFrequencyService.addString(element.tags.join(' '));
          element.tags.forEach(tag => {
            this.manualTagsService.addTag(tag);
          });
        }
        if (showAutoFileTags) {
          this.wordFrequencyService.addString(element.cleanName);
        }
        if (showAutoFolderTags) {
          this.wordFrequencyService.addString(element.partialPath.replace(/(\/)/g, ' '));
        }
      });

      // this.wordFrequencyService.cleanMap();

      this.wordFrequencyService.computeFrequencyArray(finalArray.length, numberOfTags);
    }

    return finalArray;

  }

}
