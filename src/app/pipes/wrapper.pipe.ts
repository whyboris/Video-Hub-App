import { Pipe, PipeTransform } from '@angular/core';
import { LengthPipe } from './length.pipe';
import { FileSizePipe } from './file-size.pipe';

@Pipe({
  name: 'wrapperPipe'
})
export class WrapperPipe implements PipeTransform {
  transform(value: any, pipe?: string): any {
    if (pipe === 'lengthPipe') {
      return new LengthPipe().transform(value, 'slider');
    }

    if (pipe === 'fileSizePipe') {
      return new FileSizePipe().transform(value, true);
    }
    return value;
  }
}
