import { Pipe, PipeTransform } from '@angular/core';

import { WordAndFreq } from './autotags.service';

@Pipe({
  name: 'tagFrequencyPipe'
})
export class TagFrequencyPipe implements PipeTransform {

  /**
   * Return array with only elements whose frequency exceeds minFreq
   * @param fullArray
   * @param minFreq
   */
  transform(fullArray: WordAndFreq[], minFreq: number): WordAndFreq[] {
    return fullArray.filter((element) => {
      return element.freq >= minFreq;
    });
  }

}
