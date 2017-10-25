import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'folderArrowsPipe'
})
export class FolderArrowsPipe implements PipeTransform {

  /**
   * Return only items that match search string
   * @param folderPath
   */
  transform(folderPath: string): string {

    let htmlString = folderPath;
    htmlString = htmlString.replace('/', '<span class="icon icon-arrow"></span>');
    htmlString = htmlString.replace('\\', '<span class="icon icon-arrow"></span>');
    htmlString = htmlString + '<span class="icon icon-arrow"></span>';

    return `${htmlString}`;
  }

}
