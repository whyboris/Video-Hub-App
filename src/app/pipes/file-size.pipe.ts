import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

import { GLOBALS } from '../../../node/main-globals';

const isMac = GLOBALS.macVersion;

@Pipe({
  standalone: false,
  name: 'fileSizePipe'
})
export class FileSizePipe implements PipeTransform {

  /**
   * Return size of file formatted as ### MB or ### GB
   *
   * (!) base 10 vs base 2 depends on `GLOBALS.macVersion`
   *     Macintosh uses base 10
   *     Windows uses base 2
   *
   * @param sizeInBytes -- file size in bytes
   * @param excludeParen - whether (2.3GB) or 2.3GB
   */
  transform(sizeInBytes: number, excludeParen?: boolean): string {

    if (isMac) {

      if (sizeInBytes || sizeInBytes === 0) {

        const rounded = Math.round(sizeInBytes / 1000000);

        return (excludeParen ? '' : '(')
              + (
                rounded > 999000
                  ? (rounded / 1000000).toFixed(1) + ' TB'
                  : rounded > 999
                    ? (rounded / 1000).toFixed(1)  + ' GB'
                    : rounded                      + ' MB'
                )
              + (excludeParen ? '' : ')');

      } else {
        return '';
      }

    } else {

      if (sizeInBytes || sizeInBytes === 0) {

        const rounded = Math.round(sizeInBytes / 1048576);

        return (excludeParen ? '' : '(')
            + (
                rounded > 999000
                  ? (rounded / 1048576).toFixed(1) + ' TB'
                  : rounded > 999
                    ? (rounded / 1024).toFixed(1)  + ' GB'
                    : rounded                      + ' MB'
                )
            + (excludeParen ? '' : ')');

      } else {
        return '';
      }

    }

  }

}
