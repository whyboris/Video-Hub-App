import { Pipe, PipeTransform } from '@angular/core';

import { ImageElement } from '../../../interfaces/final-object.interface';

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

    console.log('delete pipe running!');

    return finalArray.filter(element => !element.deleted);

  }

}
