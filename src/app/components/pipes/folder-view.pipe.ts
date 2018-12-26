import { Pipe, PipeTransform } from '@angular/core';

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
  transform(finalArray: any[], render: boolean, folderOnly: boolean): any[] {
    if (render) {
      const arrWithFolders = [];

      let previousFolder = '';

      finalArray.forEach((element, index) => {
        if (previousFolder !== element[0]) {
          const tempClone = [];
          tempClone[0] = element[0];
          tempClone[1] = element[1];
          tempClone[2] = '***';

          arrWithFolders.push(tempClone);
          previousFolder = element[0];
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
