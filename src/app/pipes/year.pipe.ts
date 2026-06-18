import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

@Pipe({
  standalone: false,
  name: 'yearPipe'
})
export class YearPipe implements PipeTransform {

  /**
   * Return year value of file
   * @param year
   */
  transform(year: number): string {
    if (year) {
      const rounded = Math.floor(year);
      if (!isFinite(rounded)) {
        return '∞';
      }

      return rounded.toString(10);
    } else {
      return '0';
    }
  }

}
