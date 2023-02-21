import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

import { PipeSideEffectService } from './pipe-side-effect.service';

import type { ImageElement } from '@my/final-object.interface';

@Pipe({
  name: 'playlistPipe'
})
export class PlaylistPipe implements PipeTransform {

  constructor(
    public pipeSideEffectService: PipeSideEffectService
  ) { }

  /**
   * Return only items that match search string
   * @param finalArray
   */
  transform(finalArray: ImageElement[]): ImageElement[] {

    this.pipeSideEffectService.saveCurrentResults(finalArray);

    return finalArray;
  }

}
