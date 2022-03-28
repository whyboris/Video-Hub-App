import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

import type { TranslateService } from '@ngx-translate/core';

import type { AutoTagsService } from './autotags.service';

@Pipe({
  name: 'tagMatchPipe'
})
export class TagMatchPipe implements PipeTransform {

  constructor(
    public autoTagsService: AutoTagsService,
    public translate: TranslateService,
  ) { }

  /**
   * Return number of items
   * @param string
   */
  transform(query: string): string {
    if (query === '') {
      return '';
    } else {
      return this.autoTagsService.findMatches(query).toString() + ' ' + this.translate.instant('SIDEBAR.found');
    }
  }

}
