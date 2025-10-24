import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

import { PipeSideEffectService } from './pipe-side-effect.service';

import type { ImageElement } from '../../../interfaces/final-object.interface';

@Pipe({
  standalone: false,
  name: 'countPipe'
})
export class CountPipe implements PipeTransform {

  constructor(
    public pipeSideEffectService: PipeSideEffectService
  ) { }

  /**
   * Return only items that match search string
   * @param finalArray
   */
  transform(finalArray: ImageElement[]): ImageElement[] {

    this.pipeSideEffectService.showResults(finalArray.length);

    return finalArray;
  }

}
