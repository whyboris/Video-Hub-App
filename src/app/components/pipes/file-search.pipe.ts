import { Pipe, PipeTransform } from '@angular/core';

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
   * @param fileNotFolder   {boolean} whether searching through files or folders
   * @param exclude         {boolean} whether excluding results that contain the word
   */
  transform(
    finalArray: any,
    arrOfStrings?: string[],
    useless?: boolean,
    union?: boolean,
    fileNotFolder?: boolean,
    exclude?: boolean
  ): any {
    // console.log('fileSearchPipe triggered');
    // console.log(arrOfStrings);

    


    if (arrOfStrings.length === 0) {
      return finalArray;
    } else {
      console.log('file search pipe working');
      return finalArray.filter((item) => {

        let matchFound = 0;

        arrOfStrings.forEach(element => {
          // search through the FILE or FOLDER array !!!
          const fileOrFolder = fileNotFolder ? item.fileName : item.partialPath;
          if (fileOrFolder.toLowerCase().indexOf(element.toLowerCase()) !== -1) {
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
