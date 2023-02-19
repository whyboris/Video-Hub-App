import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'folderSize'
})
export class FolderSizePipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    const fileCount = parseInt(value, 10);
    if (fileCount >= 1000) {
      return Math.floor(fileCount / 1000) + 'k';
    } else {
      return value;
    }
  }
}
