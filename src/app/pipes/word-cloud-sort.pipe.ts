import { Pipe } from '@angular/core';

import type { WordFreqAndHeight } from './word-frequency.service';
import type { PipeTransform } from '@angular/core';

@Pipe({
  standalone: false,
  name: 'wordCloudSortPipe'
})
export class WordCloudSortPipe implements PipeTransform {

  transform(cloudElements: WordFreqAndHeight[], sort: boolean): WordFreqAndHeight[] {
    if (sort) {
      let sortedCloudElements: WordFreqAndHeight[];
      sortedCloudElements = cloudElements.toSorted((a, b) => (a['word'] < b['word']) ? -1 : 1);

      return sortedCloudElements;
    } else {
      return cloudElements;
    }
  }

}
