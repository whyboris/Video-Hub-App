import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'folderSearchPipe'
})
export class FolderSearchPipe implements PipeTransform {

  /**
   * Return only items that match search string
   * @param finalArray
   * @param args            the search string
   */
  transform(finalArray: any, args?: string): any {
    if (args === '') {
      return finalArray;
    } else {
      console.log('folder search pipe working');
      return finalArray.filter(item => item[0].toLowerCase().indexOf(args.toLowerCase()) !== -1);
    }
  }

}
