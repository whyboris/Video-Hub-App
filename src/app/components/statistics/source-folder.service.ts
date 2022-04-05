import { Injectable } from '@angular/core';

import type { InputSources } from '@my/final-object.interface';

export type InputSourceConnected = Record<number, boolean>; // matches InputSources number, boolean represents if folder is connected

@Injectable()
export class SourceFolderService {

  selectedSourceFolder: InputSources = {};

  sourceFolderConnected: InputSourceConnected = {};

  currentlyScanning: Map<number, boolean> = new Map();

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

  addCurrentScanning(sourceIndex: number): void {
    console.log('starting', sourceIndex);
    this.currentlyScanning.set(sourceIndex, true);
  }

  removeCurrentScanning(sourceIndex: number): void {
    console.log('stopping', sourceIndex);
    this.currentlyScanning.set(sourceIndex, false);
  }

  areAllFinishedScanning(): boolean {
    // Array.from returns something like `[[0, true], [5, false]]`
    const allStates: boolean[] = Array.from(this.currentlyScanning).map((element) => {
      return element[1];
    });

    return allStates.every(element => element === false);
  }

}
