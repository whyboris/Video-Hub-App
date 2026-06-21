import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: false,
  name: 'folderSizePipe'
})
export class FolderSizePipe implements PipeTransform {
  transform(numberOfFiles: string): any {
    const fileCount = parseInt(numberOfFiles, 10);
    if (fileCount >= 1000) {
      return Math.floor(fileCount / 1000) + 'k';
    } else {
      return numberOfFiles;
    }
  }
}
