import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: false,
  name: 'folderSizePipe'
})
export class FolderSizePipe implements PipeTransform {

  /**
   * Return e.g. "1k" when number is over 1,000
   * @param numberOfFiles - string represeting a number
   * @returns
   */
  transform(numberOfFiles: string): string {
    const fileCount = parseInt(numberOfFiles, 10);
    if (fileCount >= 1000) {
      return Math.floor(fileCount / 1000) + 'k';
    } else {
      return numberOfFiles;
    }
  }
}
