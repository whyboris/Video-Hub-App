import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

import type { ImageElement } from '../../../interfaces/final-object.interface';

@Pipe({
  standalone: false,
  name: 'deleteFilePipe'
})
export class DeleteFilePipe implements PipeTransform {

  /**
   * Return only items are not marked as `delted`
   * @param finalArray
   * @param toggleTrigger    {boolean} Hack to trigger a refresh
   */
  transform(finalArray: ImageElement[], toggleTrigger: boolean): ImageElement[] {

    return finalArray.filter(element => !element.deleted);

  }

}
