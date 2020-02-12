import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ShowLimitService {

  cachedTotal: number = 0;

  searchResults: BehaviorSubject<number> = new BehaviorSubject(0);

  constructor() { }

  showResults(total: number): void {

    if (this.cachedTotal !== total) {
      this.cachedTotal = total;
      this.searchResults.next(this.cachedTotal);
    }

  }

}
