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
    htmlString = htmlString.replace(/\//g, '<app-icon [icon]="\'icon-arrow\'"></app-icon>');
    htmlString = htmlString.replace(/\\/g, '<app-icon [icon]="\'icon-arrow\'"></app-icon>');
    if (trailing) {
      htmlString = htmlString + '<app-icon [icon]="\'icon-arrow\'"></app-icon>';
    }

    return `${htmlString}`;
  }

}
