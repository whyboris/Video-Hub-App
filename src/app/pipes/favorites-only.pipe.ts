import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

import { PipeSideEffectService } from './pipe-side-effect.service';

import type { ImageElement } from '../../../interfaces/final-object.interface';

@Pipe({
  standalone: false,
  name: 'favoritesOnlyPipe'
})
export class FavoritesOnlyPipe implements PipeTransform {

  constructor(
    public pipeSideEffectService: PipeSideEffectService
  ) { }

  /**
   * Return only items that match search string
   * @param finalArray
   * @param viewOnlyFavorites - boolean toggle
   * @param refreshViewTrigger - to refresh pipe when needed
   */
  transform(finalArray: ImageElement[], viewOnlyFavorites: boolean, refreshViewTrigger: boolean): ImageElement[] {

    if (viewOnlyFavorites) {
      return finalArray.filter(element => element.stars === 5.5);
    } else {
      return finalArray;
    }

  }

}
