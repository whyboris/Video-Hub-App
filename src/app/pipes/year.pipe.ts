import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'yearPipe'
})
export class YearPipe implements PipeTransform {

  /**
   * Return year value of file
   * @param year
   */
  transform(year: number): string {
    if (year) {
      const rounded = Math.floor(year)

      console.log(rounded);
      if (!isFinite(rounded)) {
        return "∞"
      }

      return rounded.toString(10);
    } else {
      return '0';
    }
  }

}
