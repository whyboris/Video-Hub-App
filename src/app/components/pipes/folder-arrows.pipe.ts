import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'folderArrowsPipe'
})
export class FolderArrowsPipe implements PipeTransform {

  /**
   * Return only items that match search string
   * @param folderPath
   * @param trailing -- whether to add the trailing slash
   */
  transform(folderPath: string, trailing: boolean): string {

    let htmlString = folderPath;
    htmlString = htmlString.replace(/\//g, '<span class="icon icon-arrow"></span>');
    htmlString = htmlString.replace(/\\/g, '<span class="icon icon-arrow"></span>');
    if (trailing) {
      htmlString = htmlString + '<span class="icon icon-arrow"></span>';
    }

    return `${htmlString}`;
  }

}
