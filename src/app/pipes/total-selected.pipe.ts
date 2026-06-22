import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

import type { ImageElement } from '../../../interfaces/final-object.interface';

@Pipe({
  standalone: false,
  name: 'totalSelectedPipe'
})
export class TotalSelected implements PipeTransform {

  constructor() { }

  /**
   * Return total number of selected videos
   * @param finalArray
   */
  transform(finalArray: ImageElement[], refreshTrigger: number): number {

    return finalArray.filter(element => element.selected).length;

  }

}
