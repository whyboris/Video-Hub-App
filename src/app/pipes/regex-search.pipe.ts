import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

import type { ImageElement } from '../../../interfaces/final-object.interface';
import type { PipeSideEffectService } from './pipe-side-effect.service';

@Pipe({
  name: 'regexSearchPipe'
})
export class RegexSearchPipe implements PipeTransform {

  constructor(
    public pipeSideEffectService: PipeSideEffectService
  ) {}

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
        this.pipeSideEffectService.regexPipeError(false);
      } catch {
        re = RegExp('');
        this.pipeSideEffectService.regexPipeError(true);
      }

      return finalArray.filter(item => {
        return item.fileName.match(re);
      });

    }
  }

}
