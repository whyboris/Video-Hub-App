import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {
  transform(array: any[], field: string): any[] {

    // If using multi-level selector or keyvalue pipe in foreach, you need to nest at a deeper level
    const fields = field.split('.');

    array.sort((a: any, b: any) => {

      // Init strings
      let s1, s2;
      if (fields.length > 1) {
        s1 = a[fields[0]][fields[1]];
        s2 = b[fields[0]][fields[1]];
      } else {
        s1 = a[field];
        s2 = b[field];
      }

      // Ordering logic
      if (s1 < s2) {
        return -1;
      } else if (s1 > s2) {
        return 1;
      } else {
        return 0;
      }
    });
    return array;
  }
}
