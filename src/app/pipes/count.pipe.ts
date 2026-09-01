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
   * Return the same input but notify Pipe Side Effect Service to show total count
   * @param finalArray
   */
  transform(finalArray: ImageElement[]): ImageElement[] {

    this.pipeSideEffectService.showResults(finalArray.length);

    return finalArray;
  }

}
