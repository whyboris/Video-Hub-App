import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { ImageElement } from '../../../interfaces/final-object.interface';

@Injectable()
export class PipeSideEffectService {

  cachedTotal: number = 0;

  galleryShowing: ImageElement[];

  searchResults: BehaviorSubject<number> = new BehaviorSubject(0);

  /**
   * Update the searchResults BehaviorSubject (to show total number of videos showing in gallery)
   * @param total
   */
  showResults(total: number): void {

    if (this.cachedTotal !== total) {
      this.cachedTotal = total;
      this.searchResults.next(this.cachedTotal);
    }

  }

  /**
   * Playlist pipe stores what is currently showing in the gallery
   * @param results
   */
  saveCurrentResults(results: ImageElement[]): void {
    this.galleryShowing = results;
  }

}
