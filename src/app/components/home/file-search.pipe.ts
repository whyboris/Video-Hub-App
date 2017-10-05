import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSearchPipe'
})
export class FileSearchPipe implements PipeTransform {

  /**
   * Return only items that match search string
   * @param hashtagArray
   * @param args            the search string
   */
  transform(hashtagArray: any, args?: string): Array<string> {
    console.log('file search pipe working');
    console.log(hashtagArray);
    if (args === '') {
      return hashtagArray;
    } else {
      return hashtagArray.filter(item => item[1].toLowerCase().indexOf(args.toLowerCase()) !== -1);
    }
  }

}
