import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

@Pipe({
  name: 'timesPlayedPipe'
})
export class TimesPlayedPipe implements PipeTransform {

  /**
   * Return times played of file as int
   * add 1 to result because min value needs to be -1 in order to include files with 0 times played
   * @param timesPlayed -- times played value
   */
  transform(timesPlayed: number): string {
    if (timesPlayed) {
      const rounded = Math.floor(timesPlayed + 1);

      console.log(rounded);
      if (!isFinite(rounded)) {
        return '∞';
      }

      return rounded.toString(10);
    } else {
      return '0';
    }
  }

}
