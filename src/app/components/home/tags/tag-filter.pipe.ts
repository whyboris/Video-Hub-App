import { Pipe, PipeTransform } from '@angular/core';

import { WordAndFreq } from './tags.service';

@Pipe({
  name: 'tagFilterPipe'
})
export class TagFilterPipe implements PipeTransform {

  /**
   * Return number of items
   * @param fullArray
   * @param query
   * @param dummyBool -- only to trigger redraw
   */
  transform(fullArray: WordAndFreq[], query: string, dummyBool: string): WordAndFreq[] {
    return fullArray.filter((element) => {
      return element.word.includes(query.toLowerCase());
    });
  }

}
