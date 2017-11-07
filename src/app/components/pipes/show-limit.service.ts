import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class ShowLimitService {

  searchResults = new BehaviorSubject({});

  constructor() { }

  showResults(showing: number, total: number): void {
    if (total < showing ) {
      showing = total;
    }
    console.log('Showing: ' + showing + '/' + total);
    this.searchResults.next({ showing: showing, total: total });
  }

}
