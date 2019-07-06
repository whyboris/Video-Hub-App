import { Pipe, PipeTransform } from '@angular/core';

import { AutoTagsService } from './autotags.service';

@Pipe({
  name: 'tagMatchPipe'
})
export class TagMatchPipe implements PipeTransform {

  constructor(
    public autoTagsService: AutoTagsService
  ) { }

  /**
   * Return number of items
   * @param string
   */
  transform(query: string): string {
    if (query === '') {
      return '';
    } else {
      return this.autoTagsService.findMatches(query).toString() + ' found'; // TODO someday add i18n
    }
  }

}
