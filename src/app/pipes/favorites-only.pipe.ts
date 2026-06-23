import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

import type { ImageElement } from '../../../interfaces/final-object.interface';

@Pipe({
  standalone: false,
  name: 'favoritesOnlyPipe'
})
export class FavoritesOnlyPipe implements PipeTransform {

  constructor() { }

  /**
   * Return only items that are favorites (5-star rating) if `viewOnlyFavorites` is true
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
