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
  transform(finalArray: ImageElement[], render: boolean, prefixPath?: string[]): any[] {
    if (render) {
      const arrWithFolders = [];

      let previousPath = '';

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
          index: -1, // always show at the top
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
        const path = element.partialPath.substring(prefixPath[0].length + 1).split('/');
        if (element.partialPath === prefixPath[0]) {
          arrWithFolders.push(element);
        } else if (path.length >= 1) {
          if (path[0] !== previousPath) {
            const tempClone: ImageElement = {
              cleanName: '***',
              duration: 0,
              durationDisplay: '',
              fileName: path[0],
              fileSize: element.fileSize,
              fileSizeDisplay: '1',
              hash: element.hash,
              height: 0,
              index: element.index,
              mtime: element.mtime,
              partialPath: prefixPath + '/' + path[0],
              resBucket: 0,
              resolution: '',
              screens: 10, // temp hardcoded
              stars: 0.5,
              timesPlayed: 0,
              width: 0,
            };
            arrWithFolders.push(tempClone);
            previousPath = path[0];
          } else {
            // Folder stats will be the sum of the video stats within them
            arrWithFolders[arrWithFolders.length - 1].fileSize += element.fileSize;
            arrWithFolders[arrWithFolders.length - 1].fileSizeDisplay =
                  parseFloat(arrWithFolders[arrWithFolders.length - 1].fileSizeDisplay) + 1;
            arrWithFolders[arrWithFolders.length - 1].duration += element.duration;
            arrWithFolders[arrWithFolders.length - 1].timesPlayed += element.timesPlayed;
            arrWithFolders[arrWithFolders.length - 1].mtime = Math.max(arrWithFolders[arrWithFolders.length - 1].mtime, element.mtime);
            arrWithFolders[arrWithFolders.length - 1].stars += element.stars - 0.5;
            arrWithFolders[arrWithFolders.length - 1].hash += ':' + element.hash;
          }
        }
      });

      // console.log('folderViewPipe running');

      return arrWithFolders;
    } else {
      return finalArray;
    }
  }

}
