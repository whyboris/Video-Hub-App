import { Pipe, PipeTransform } from '@angular/core';

import { ImageElement } from '../common/final-object.interface';

@Pipe({
  name: 'folderViewPipe'
})
export class FolderViewPipe implements PipeTransform {

  constructor() { }

  /**
   * Inserts folders os elements for file view
   * @param finalArray
   * @param render      whether to insert folders
   * @param folderOnly  whether to ONLY show folders
   */
  transform(finalArray: ImageElement[], render: boolean, folderOnly: boolean): any[] {
    if (render) {
      const arrWithFolders = [];

      let previousFolder = '';

      finalArray.forEach((element, index) => {
        if (previousFolder !== element.partialPath) {
          const tempClone: ImageElement = {
            cleanName: '***',
            duration: 0,
            durationDisplay: '',
            fileName: element.fileName,
            fileSize: 0,
            fileSizeDisplay: '',
            hash: '',
            height: 0,
            index: 0,
            mtime: 0,
            partialPath: element.partialPath,
            resBucket: 0,
            resolution: '',
            screens: 10, // temp hardcoded
            stars: 0.5,
            timesPlayed: 0,
            width: 0,
          };

          arrWithFolders.push(tempClone);
          previousFolder = element.partialPath;
        }
        if (!folderOnly) {
          arrWithFolders.push(element);
        }
      });

      // console.log('folderViewPipe running');

      return arrWithFolders;
    } else {
      return finalArray;
    }
  }

}
