import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lengthPipe'
})
export class LengthPipe implements PipeTransform {

  /**
   * Return length of video file formatted as X:XX:XX
   * @param numOfSec
   */
  transform(numOfSec: number, arg: any): string {
    if (numOfSec === undefined || numOfSec === 0) {
      return '';
    } else {
      const hh = (Math.floor(numOfSec / 3600)).toString();
      const mm = (Math.floor(numOfSec / 60) % 60).toString();
      const ss = (Math.floor(numOfSec) % 60).toString();

      return (hh !== '0' ? hh + ':' : '')
           + (mm.length !== 2 ? '0' + mm : mm)
           + ':'
           + (ss.length !== 2 ? '0' : '') + ss;
    }
  }

}
