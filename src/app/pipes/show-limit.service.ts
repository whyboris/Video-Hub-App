import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ShowLimitService {

  cachedTotal = 0;

  searchResults = new BehaviorSubject({});

  constructor() { }

  showResults(showing: number, total: number): void {
    if (total < showing ) {
      showing = total;
    }

    if (this.cachedTotal !== total) {
      this.cachedTotal = total;
      this.searchResults.next({ showing: showing, total: this.cachedTotal });
    }

  }

}
