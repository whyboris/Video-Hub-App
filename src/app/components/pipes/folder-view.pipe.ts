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
   * @param affixFolder when TRUE - add 'showFolder: true' to element, change nothing else
   */
  transform(finalArray: ImageElement[], render: boolean, folderOnly: boolean, affixFolder: boolean): any[] {
    if (render && !affixFolder) {
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
            mtime: 0,
            hash: '',
            height: 0,
            index: 0,
            partialPath: element.partialPath,
            resBucket: 0,
            resolution: '',
            screens: 10, // temp hardcoded
            stars: 0.5,
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

    } else if (affixFolder) {

      let previousFolder = '';

      finalArray.forEach((element => {
        if (previousFolder !== element.partialPath) {
          element.showFolder = true;
          previousFolder = element.partialPath;
        }
      }));

      return finalArray;

    } else {
      return finalArray;
    }
  }

}
