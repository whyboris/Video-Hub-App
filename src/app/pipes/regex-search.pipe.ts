import { Pipe, PipeTransform } from '@angular/core';

import { ImageElement } from '../../../interfaces/final-object.interface';

@Pipe({
  name: 'regexSearchPipe'
})
export class RegexSearchPipe implements PipeTransform {

  /**
   * Return only items that match the regex
   * @param finalArray
   * @param regexString  the regex string
   */
  transform(finalArray: ImageElement[], regexString?: string): ImageElement[] {
    if (regexString === '') {
      return finalArray;
    } else {

      let re;

      try {
        re = RegExp(regexString, 'i');
      } catch {
        re = RegExp('');
      }

      return finalArray.filter(item => {
        return item.fileName.match(re);
      })

    }
  }

}
