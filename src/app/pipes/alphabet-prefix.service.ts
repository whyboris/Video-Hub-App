import { Injectable } from '@angular/core';

@Injectable()
export class AlphabetPrefixService {

  lastLetter: string = undefined;

  constructor() { }

  /**
   * State whether to show letter next to the tag
   * @param current character
   */
  addPrefix(current: string): boolean {

    if (this.lastLetter === current) {
      return false;
    } else {
      this.lastLetter = current;
      return true;
    }

  }

}
