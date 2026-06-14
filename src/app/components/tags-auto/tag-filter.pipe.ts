import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

import type { WordAndFreq } from './autotags.service';

@Pipe({
  standalone: false,
  name: 'tagFilterPipe'
})
export class TagFilterPipe implements PipeTransform {

  /**
   * Return number of items
   * @param fullArray
   * @param query
   */
  transform(fullArray: WordAndFreq[], query: string): WordAndFreq[] {
    return fullArray.filter((element) => {
      return element.word.includes(query.toLowerCase());
    });
  }

}
