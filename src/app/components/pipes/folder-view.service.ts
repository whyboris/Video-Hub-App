import { Injectable } from '@angular/core';

@Injectable()
export class FolderViewService {

  lastValue = '';

  constructor() { }

  shouldWeShow(folderString: string): boolean {
    // console.log(folderString);
    if (this.lastValue === folderString) {
      return false;
    } else {
      this.lastValue = folderString;
      return true;
    }
  }

}
