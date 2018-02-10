import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSizePipe'
})
export class FileSizePipe implements PipeTransform {

  /**
   * Return size of file formatted as XXXmb
   * @param numOfMb
   */
  transform(numOfMb: number): string {
    if (numOfMb) {
      const rounded = Math.round(numOfMb);
      return '(' + (rounded > 999 ? Math.round(rounded / 100) / 10 + 'gb' : rounded + 'mb') + ')';
    } else {
      return '';
    }
  }

}
