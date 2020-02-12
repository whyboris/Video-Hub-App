import { Pipe, PipeTransform } from '@angular/core';

import { PipeSideEffectService } from './pipe-side-effect.service';

import { ImageElement } from '../../../interfaces/final-object.interface';

@Pipe({
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
  transform(finalArray: ImageElement[]): any {

    this.pipeSideEffectService.showResults(finalArray.length);

    return finalArray;
  }

}
