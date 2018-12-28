import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'magicSearchPipe'
})
export class MagicSearchPipe implements PipeTransform {

  /**
   * Return only items that match search string
   * @param finalArray
   * @param searchString  the search string
   */
  transform(finalArray: any, searchString?: string): any {
    if (searchString === '') {
      return finalArray;
    } else {
      console.log('magic search pipe working');
      return finalArray.filter(item =>
        item.partialPath.toLowerCase().indexOf(searchString.toLowerCase()) !== -1
        || item.fileName.toLowerCase().indexOf(searchString.toLowerCase()) !== -1
      );
    }
  }

}
