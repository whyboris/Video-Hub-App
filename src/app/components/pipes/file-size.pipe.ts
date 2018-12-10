import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSizePipe'
})
export class FileSizePipe implements PipeTransform {

  /**
   * Return size of file formatted as XXX{mb,gb}
   * @param size in bytes
   */
  transform(sizeInBytes: number): string {
    if (sizeInBytes) {
      const rounded = Math.round(sizeInBytes / 1000000.00);
      return '(' + (rounded > 999 ? Math.round(rounded / 100) / 10 + 'gb' : rounded + 'mb') + ')';
    } else {
      return '';
    }
  }

}
