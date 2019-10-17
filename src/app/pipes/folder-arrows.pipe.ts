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

    const arrowString: string = '<span class="icon icon-arrow"></span>';

    let htmlString = folderPath;
    htmlString = htmlString.replace(/\\/g, arrowString);
    if (trailing) {
      htmlString = htmlString + arrowString;
    }

    return `${htmlString}`;
  }

}
