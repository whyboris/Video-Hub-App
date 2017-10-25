import { Pipe, PipeTransform } from '@angular/core';

import { FolderViewService } from './folder-view.service';

@Pipe({
  name: 'folderViewPipe'
})
export class FolderViewPipe implements PipeTransform {

  constructor(
    public folderViewService: FolderViewService
  ) { }

  /**
   * Return only items that match search string
   * @param display {boolean}      <--- doesn't matter
   * @param folderString {string}  <--- the current folder to decide whether to show
   */
  transform(display: boolean, folderString: string): boolean {
    return this.folderViewService.shouldWeShow(folderString);
  }

}
