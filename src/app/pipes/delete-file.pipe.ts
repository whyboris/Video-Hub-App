import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

import type { ImageElement } from '../../../interfaces/final-object.interface';

@Pipe({
  name: 'deleteFilePipe'
})
export class DeleteFilePipe implements PipeTransform {

  /**
   * Return only items that match search string
   * @param finalArray
   * @param toggleHack    {boolean} Hack to return zero results
   */
  transform(finalArray: ImageElement[], toggleHack: boolean): ImageElement[] {

    return finalArray.filter(element => !element.deleted);

  }

}
