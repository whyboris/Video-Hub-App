import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

import { PipeSideEffectService } from './pipe-side-effect.service';

import type { ImageElement } from '../../../interfaces/final-object.interface';

@Pipe({
  standalone: false,
  name: 'playlistOnlyPipe'
})
export class PlaylistOnlyPipe implements PipeTransform {

  constructor(
    public pipeSideEffectService: PipeSideEffectService
  ) { }

  /**
   * Return only items that match search string
   * @param finalArray
   * @param viewOnlyPlaylist - boolean toggle
   * @param refreshViewHack - to refresh pipe when needed
   */
  transform(finalArray: ImageElement[], viewOnlyPlaylist: boolean, refreshViewHack: boolean): ImageElement[] {

    if (viewOnlyPlaylist) {
      return finalArray.filter(element => element.playlist);
    } else {
      return finalArray;
    }

  }

}
