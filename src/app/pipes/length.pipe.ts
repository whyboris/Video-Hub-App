import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lengthPipe'
})
export class LengthPipe implements PipeTransform {

  /**
   * Return length of video file formatted as X:XX:XX
   * or if `omitSeconds` then `Xhr XXmin`
   * @param numOfSec
   * @param omitSeconds
   * @param printHrMin -- include `hr` and `min` in display
   * @param printDays  -- include `days` -- used only in `statistics.component.html`
   */
  transform(
    numOfSec: number,
    omitSeconds?: boolean,
    printHrMin?: boolean,
    printDays?: boolean
  ): string {
    if (numOfSec === undefined) {
      return '';
    } else if (numOfSec === Infinity) {
      return 'every';
    } else {
      const hh = (Math.floor(numOfSec / 3600)).toString();
      const mm = (Math.floor(numOfSec / 60) % 60).toString();
      const ss = (Math.floor(numOfSec) % 60).toString();

      if (omitSeconds) {
        const zeroHours = (hh === '0');
        const display = (zeroHours ? '' : hh + ':')
               + (mm.length !== 2 ? (zeroHours ? '' : '0') + mm : mm)
               + (zeroHours ? ' min' : '');
        if (printHrMin) {
          if (printDays) {
            const dd: number = (Math.floor(numOfSec / 86400));
            if (dd > 3) {
              return dd.toString() + '+ days';
            }
          }
          return (display.replace(':', ' hr '));
        } else {
          return display;
        }
      } else {
        return (hh !== '0' ? hh + ':' : '')
               + (mm.length !== 2 ? '0' + mm : mm)
               + ':'
               + (ss.length !== 2 ? '0' : '') + ss;
      }
    }
  }

}
