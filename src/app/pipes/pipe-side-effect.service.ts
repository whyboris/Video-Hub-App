import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

@Injectable()
export class PipeSideEffectService {

  cachedTotal: number = 0;

  searchResults: BehaviorSubject<number> = new BehaviorSubject(0);

  showResults(total: number): void {

    if (this.cachedTotal !== total) {
      this.cachedTotal = total;
      this.searchResults.next(this.cachedTotal);
    }

  }

}
