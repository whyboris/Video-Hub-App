import { Pipe, PipeTransform } from '@angular/core';

import { TagsService } from './tags.service';

@Pipe({
  name: 'tagMatchPipe'
})
export class TagMatchPipe implements PipeTransform {

  constructor(
    public tagsService: TagsService
  ) { }

  /**
   * Return number of items
   * @param string
   */
  transform(query: string): string {
    if (query === '') {
      return '';
    } else {
      return this.tagsService.findMatches(query).toString() + ' found';
    }
  }

}
