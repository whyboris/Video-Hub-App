import { Pipe, PipeTransform } from '@angular/core';

import { ImageElement } from '../common/final-object.interface';

@Pipe({
  name: 'fileSearchPipe'
})
export class FileSearchPipe implements PipeTransform {

  /**
   * Return only items that match search string
   * @param finalArray
   * @param arrOfStrings    {string}  the search string array
   * @param useless         {boolean} that is flipped just to trigger pipe to work
   * @param union           {boolean} whether it's a union or intersection
   * @param searchType      {number} type of search (0: folder, 1: file, 2: tag)
   * @param exclude         {boolean} whether excluding results that contain the word
   */
  transform(
    finalArray: ImageElement[],
    arrOfStrings?: string[],
    useless?: boolean,
    union?: boolean,
    searchType?: number,
    exclude?: boolean,
    manualTags?: boolean,
    autoFileTags?: boolean,
    autoFolderTags?: boolean
  ): any {
    // console.log('fileSearchPipe triggered');
    // console.log(arrOfStrings);

    if (arrOfStrings.length === 0) {
      return finalArray;
    } else {
      console.log('file search pipe working');
      return finalArray.filter((item) => {

        // exact prefix match
        if (arrOfStrings[0].startsWith('/')) {
          return item.partialPath.startsWith(arrOfStrings[0]);
        }

        let matchFound = 0;

        arrOfStrings.forEach(element => {
          // search through the FILE or FOLDER array !!!
          let searchString = '';
          if (searchType === 0) {
            searchString = item.partialPath;
          } else if (searchType === 1) {
            searchString = item.fileName;
          } else if (searchType === 2) {
            searchString = '';
            if (manualTags && item.tags) {
              searchString += item.tags.join(' ');
            }
            if (autoFileTags) {
              searchString += ' ' + item.cleanName;
            }
            if (autoFolderTags) {
              searchString += ' ' + item.partialPath.replace(/(\/)/, ' ');
            }
          }
          if (searchString.toLowerCase().indexOf(element.toLowerCase()) !== -1) {
            matchFound++;
          }
        });

        if (exclude) {
          return matchFound === 0;
        } else if (union) {
          // at least one filter exists in searched string
          return matchFound > 0;
        } else {
          // every filter exits in searched string
          return matchFound === arrOfStrings.length;
        }

      });
    }
  }

}
