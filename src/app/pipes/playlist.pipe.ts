import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

import { PipeSideEffectService } from './pipe-side-effect.service';
import { ElectronService } from '../providers/electron.service';

import type { ImageElement } from '../../../interfaces/final-object.interface';

@Pipe({
  name: 'playlistPipe',
  pure: false
})
export class PlaylistPipe implements PipeTransform {

  constructor(
    public pipeSideEffectService: PipeSideEffectService,
    public electronService: ElectronService
  ) { }

  /**
   * Return only items that match search string
   * @param finalArray
   * @param trigger - optional trigger to make pipe reactive
   */
  transform(finalArray: ImageElement[], trigger?: number): ImageElement[] {

    this.pipeSideEffectService.saveCurrentResults(finalArray);

    // Read playlist file
    this.electronService.ipcRenderer.send('read-pls-file', 'temp.pls');

    // Listen for the response
    this.electronService.ipcRenderer.once('pls-file-content', (event, entries) => {
      if (entries && entries.length > 0) {
        const playlist = entries;
        this.pipeSideEffectService.saveCurrentPlaylist(playlist);
      }
    });

    return finalArray;
  }

}
