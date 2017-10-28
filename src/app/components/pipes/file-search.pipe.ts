import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSearchPipe'
})
export class FileSearchPipe implements PipeTransform {

  /**
   * Return only items that match search string
   * @param finalArray
   * @param arrOfStrings            the search string array
   * @param useless                 boolean that is flipped just to trigger pipe to work
   */
  transform(finalArray: any, arrOfStrings?: string[], useless?: boolean, union?: boolean, fileNotFolder?: boolean): any {
    console.log('fileSearchPipe triggered');
    console.log(arrOfStrings);

    // search through the FILE or FOLDER array !!!
    const fileOrFolder = fileNotFolder ? 1 : 0;


    if (arrOfStrings.length === 0) {
      return finalArray;
    } else {
      console.log('file search pipe working');
      return finalArray.filter((item) => {

        let matchFound = 0;

        arrOfStrings.forEach(element => {
          if (item[fileOrFolder].toLowerCase().indexOf(element.toLowerCase()) !== -1) {
            matchFound++;
          }
        });

        if (union) {
          return matchFound > 0;
        } else {
          return matchFound === arrOfStrings.length;
        }

      });
    }
  }

}
