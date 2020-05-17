import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sidebarHeightPipe'
})
export class SidebarHeightPipe implements PipeTransform {

  /**
   * Return number of pixels to offset the sidebar (as a string)
   * @param finalArray
   * @param searchString  the search string
   */
  transform(
    menuHidden: boolean,
    hideTop: boolean,
    showRelatedVideosTray: boolean,
    showTagTray: boolean
  ): string {

    return (
        (menuHidden                             ? -32 :  0)
      + (hideTop                                ?  53 : 98)
      + ((showRelatedVideosTray || showTagTray) ? 170 :  0)
      ).toString();

  }

}
