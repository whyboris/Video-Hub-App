import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lengthPipe'
})
export class LengthPipe implements PipeTransform {

  /**
   * Return only items that match search string
   * @param numOfSec
   */
  transform(numOfSec: number, arg: any): string {
    const hh = (Math.floor(numOfSec / 3600)).toString();
    const mm = (Math.floor(numOfSec / 60) % 60).toString();
    const ss = (Math.floor(numOfSec) % 60).toString();
    return (hh !== '0' ? hh + ':' : '')
           + (mm.length !== 2 ? '0' + mm : mm)
           + ':'
           + (ss.length !== 2 ? '0' : '') + ss;
  }

}
