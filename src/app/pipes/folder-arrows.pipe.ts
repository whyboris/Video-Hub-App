import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

@Pipe({
  standalone: false,
  name: 'folderArrowsPipe'
})
export class FolderArrowsPipe implements PipeTransform {

  /**
   * Return HTML string with `>` arrow instead of the `/` path dividier
   * @param folderPath
   */
  transform(folderPath: string): string {

    const arrowString = '<span class="icon icon-arrow"></span>';

    const htmlString = folderPath.replace(/\/|\\/g, arrowString);

    return `${htmlString}`;

  }

}
