import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

import type { ImageElement } from '../../../interfaces/final-object.interface';

type SearchType = 'folder' | 'file' | 'tag' | 'notes';

@Pipe({
  name: 'fileSearchPipe'
})
export class FileSearchPipe implements PipeTransform {

  /**
   * Return only items that match search string
   * @param finalArray
   * @param arrOfStrings    {string}  the search string array
   * @param renderHack      {boolean} that is flipped just to trigger an pipe update
   * @param union           {boolean} whether it's a union or intersection
   * @param searchType      {SearchType}
   * @param exclude         {boolean} whether excluding results that contain the word
   * @param manualTags      {boolean}
   * @param autoFileTags    {boolean}
   * @param autoFolderTags  {boolean}
   */
  transform(
    finalArray: ImageElement[],
    arrOfStrings?: string[],
    renderHack?: boolean,
    union?: boolean,
    searchType?: SearchType,
    exclude?: boolean,
    manualTags?: boolean,
    autoFileTags?: boolean,
    autoFolderTags?: boolean
  ): ImageElement[] {

    if (arrOfStrings.length === 0) {
      return finalArray;
    } else {

      return finalArray.filter((item) => {

        // exact prefix match
        if (arrOfStrings[0].startsWith('/')) {
          return item.partialPath.startsWith(arrOfStrings[0]);
        }

        let matchFound = 0;

        arrOfStrings.forEach(element => {

          let searchString = '';
          if (searchType === 'folder') {
            searchString = item.partialPath;

          } else if (searchType === 'file') {
            searchString = item.fileName;

          } else if (searchType === 'notes') {
            searchString = item.notes || '';

          } else if (searchType === 'tag') {
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
