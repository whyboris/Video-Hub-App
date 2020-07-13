import { Injectable } from '@angular/core';

import { InputSources } from '../../../../interfaces/final-object.interface';

export type InputSourceConnected = Record<number, boolean>; // matches InputSources number, boolean represents if folder is connected

@Injectable()
export class SourceFolderService {

  selectedSourceFolder: InputSources = {};

  sourceFolderConnected: InputSourceConnected = {};

  /**
   * Set all source folders to `NOT connected'
   */
  resetConnected(): void {
    Object.keys(this.selectedSourceFolder).forEach((key: string) => {
      this.sourceFolderConnected[key] = false;
    });
    console.log(this.selectedSourceFolder);
    console.log(this.sourceFolderConnected);
  }

}
