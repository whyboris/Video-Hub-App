import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSizePipe'
})
export class FileSizePipe implements PipeTransform {

  /**
   * Return size of file formatted as ### MB or ### GB
   * @param sizeInBytes -- file size in bytes
   * @param excludeParen - whether (2.3GB) or 2.3GB
   */
  transform(sizeInBytes: number, excludeParen?: boolean): string {
    if (sizeInBytes) {
      const rounded = Math.round(sizeInBytes / 1000000);

      return (excludeParen ? '' : '(')
           + (
              rounded > 999
                ? (rounded / 1000).toFixed(1) + ' GB'
                : rounded                     + ' MB'
              )
           + (excludeParen ? '' : ')');
    } else {
      return '';
    }
  }

}
