import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSearchPipe'
})
export class FileSearchPipe implements PipeTransform {

  /**
   * Return only items that match search string
   * @param finalArray
   * @param args            the search string
   */
  transform(finalArray: any, args?: string): any {
    if (args === '') {
      return finalArray;
    } else {
      console.log('file search pipe working');
      return finalArray.filter(item => item[1].toLowerCase().indexOf(args.toLowerCase()) !== -1);
    }
  }

}
