import { Pipe, PipeTransform } from '@angular/core';
import { LengthPipe } from './length.pipe';

@Pipe({
  name: 'wrapperPipe'
})
export class WrapperPipe implements PipeTransform {
  transform(value: any, pipe?: string): any {
    if (pipe === 'lengthPipe') {
      return new LengthPipe().transform(value, true);
    }
    return value;
  }
}
