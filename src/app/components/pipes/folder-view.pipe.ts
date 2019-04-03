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
  transform(finalArray: ImageElement[], render: boolean, folderOnly: boolean, prefixPath?: string[]): any[] {
    if (render) {
      const arrWithFolders = [];

      let previousFolder = '';
      let previousPath = '';

      console.log(prefixPath);
      if (prefixPath.length) {
        const upButton: ImageElement = {
          cleanName: '***',
          duration: 0,
          durationDisplay: '',
          fileName: 'up',
          fileSize: 0,
          fileSizeDisplay: '',
          hash: '',
          height: 0,
          index: 0,
          mtime: 0,
          partialPath: prefixPath[0].substring(0, prefixPath[0].lastIndexOf('/')),
          resBucket: 0,
          resolution: '',
          screens: 10, // temp hardcoded
          stars: 0.5,
          timesPlayed: 0,
          width: 0,
        };
        arrWithFolders.push(upButton);
      }
      if (!prefixPath.length) {
        prefixPath = [''];
      }
      finalArray.forEach((element, index) => {
        if (prefixPath.length) {
          const path = element.partialPath.substring(prefixPath[0].length + 1).split('/');
          if (!folderOnly && element.partialPath === prefixPath[0]) {
            arrWithFolders.push(element);
          } else if (path.length >= 1 && path[0] !== previousPath) {
            const tempClone: ImageElement = {
              cleanName: '***',
              duration: 0,
              durationDisplay: '',
              fileName: path[0],
              fileSize: 0,
              fileSizeDisplay: '',
              hash: '',
              height: 0,
              index: 0,
              mtime: 0,
              partialPath: prefixPath + '/' + path[0],
              resBucket: 0,
              resolution: '',
              screens: 10, // temp hardcoded
              stars: 0.5,
              timesPlayed: 0,
              width: 0,
            };
            console.log(tempClone);
            arrWithFolders.push(tempClone);
            previousPath = path[0];
          }
        } else if (previousFolder !== element.partialPath) {
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
        } else if (!folderOnly) {
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
