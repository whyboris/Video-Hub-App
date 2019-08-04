import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSizePipe'
})
export class FileSizePipe implements PipeTransform {

  /**
   * Return size of file formatted as XXX{mb,gb}
   * @param sizeInBytes -- file size in bytes
   */
  transform(sizeInBytes: number, excludeParen: boolean): string {
    if (sizeInBytes) {
      const rounded = Math.round(sizeInBytes / 1000000);
      // tslint:disable-next-line:max-line-length
      return (excludeParen ? '' : '(') + (rounded > 999 ? Math.round(rounded / 100) / 10 + 'gb' : rounded + 'mb') + (excludeParen ? '' : ')');
    } else {
      return '';
    }
  }

}
