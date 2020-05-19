import { Pipe, PipeTransform } from '@angular/core';

type TimeFormat = 'slider' | 'file' | 'folder';

@Pipe({
  name: 'lengthPipe'
})
export class LengthPipe implements PipeTransform {

  /**
   * Return length of video file formatted as X:XX:XX
   * or if `omitSeconds` then `Xhr XXmin`
   * @param numOfSec
   * @param destination -- dictates the output format (TimeFormat)
   */
  transform(
    numOfSec: number,
    destination: TimeFormat = 'file'
  ): string {

    if (numOfSec === undefined) {
      // short circuit
      return '';
    } else if (numOfSec === Infinity) {
      // happens on a slider
      return 'every';
    }

    const d: number = Math.floor(numOfSec / 86400);
    const h: string = (Math.floor(numOfSec / 3600)).toString();
    const m: string = (Math.floor(numOfSec / 60) % 60).toString();
    const s: string = (Math.floor(numOfSec) % 60).toString();

    if (destination === 'slider') {
      // slider should behave thus:
      // 0 min ... 1 min ... 59 min, 1:00, 1:01 ... 4:20 ...
      if (h !== '0') {
        return h + ':' + m.padStart(2, '0');
      } else {
        return m + ' min';
      }
    } else if (destination === 'file') {
      // file should behave thus:
      // 0:00, 0:01 ... 0:59, 1:00, 1:01 ... 59:59, 1:00:00 ... 3:14:15 ...
      if (h !== '0') {
        return h + ':' + m.padStart(2, '0') + ':' + s.padStart(2, '0');
      } else {
        return           m.padStart(2, '0') + ':' + s.padStart(2, '0');
      }
    } else if (destination === 'folder') {
      // should behave thus:
      // <1min, 1min ... 59 min, 1 hr 00 min, 1 hr 01 min ... 3 hr 47 min ... 23 hr 59 min, 24 hr ... 69 hr ... 3+ days ... 42+ days
      if (d > 3) {
        return d.toString() + '+ days';
      } else if (parseInt(h, 10) > 24) {
        return h + ' hr';
      } else if (h !== '0') {
        return h + ' hr ' + m.padStart(2, '0') + ' min';
      } else if (m !== '0') {
        return m + ' min';
      } else {
        return '<1 min';
      }
    }
  }

}
