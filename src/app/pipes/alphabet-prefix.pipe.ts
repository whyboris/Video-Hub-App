import { Pipe, PipeTransform } from '@angular/core';

import { WordAndFreq } from '../components/tags-auto/autotags.service';

@Pipe({
  name: 'alphabetPrefixPipe'
})
export class AlphabetPrefixPipe implements PipeTransform {

  /**
   * Change the prefix string - controls whether prefix is shown
   * @param allTags
   */
  transform(allTags: WordAndFreq[]): WordAndFreq[] {

    let lastLetter: string = '';

    allTags.forEach((element: WordAndFreq) => {

      const current = element.word.charAt(0);

      if (lastLetter === current) {
        element.prefix = undefined;
      } else {
        lastLetter = current;
        element.prefix = current;
      }

    });

    return allTags;
  }

}
