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

    const arrowString: string = '<span class="icon icon-arrow"></span>';

    const htmlString = folderPath.replace(/\/|\\/g, arrowString);

    return `${htmlString}`;

  }

}
