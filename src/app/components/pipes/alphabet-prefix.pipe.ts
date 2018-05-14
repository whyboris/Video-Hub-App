import { Pipe, PipeTransform } from '@angular/core';

import { AlphabetPrefixService } from './alphabet-prefix.service';

@Pipe({
  name: 'alphabetPrefixPipe'
})
export class AlphabetPrefixPipe implements PipeTransform {

  constructor(
    public alphabetService: AlphabetPrefixService
  ) {}

  /**
   * Return only items that match search string
   * @param someTag
   */
  transform(someTag: string): string {

    let htmlString = '';

    if (this.alphabetService.addPrefix(someTag.charAt(0))) {
      htmlString = someTag.charAt(0);
    }

    return htmlString;
  }

}
