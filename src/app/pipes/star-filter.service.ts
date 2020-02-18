import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

@Injectable()
export class StarFilterService {

  frequencyMap: Map<number, number> = new Map();
  finalStarMapBehaviorSubject = new BehaviorSubject([]);

  /**
   * Reset the map to empty
   */
  public resetMap(): void {
    this.frequencyMap = new Map();
    this.frequencyMap.set(0.5, 0);
    this.frequencyMap.set(1.5, 0);
    this.frequencyMap.set(2.5, 0);
    this.frequencyMap.set(3.5, 0);
    this.frequencyMap.set(4.5, 0);
    this.frequencyMap.set(5.5, 0);
  }

  /**
   * Add each resolution to the map
   * @param starRating
   */
  public addString(starRating: any): void {
    let result: number;
    if (starRating === undefined) {
      result = 0;
    } else {
      result = starRating;
    }
    this.addStarRating(result);
  }

  /**
   * Populate the frequency map
   * @param resolution
   */
  private addStarRating(starRating: number): void {
    this.frequencyMap.set(starRating, this.frequencyMap.get(starRating) + 1);
  }

  /**
   * Computes the array 6 objects long
   * Creates `height` property
   * calls `.next` on BehaviorSubject
   */
  public computeFrequencyArray(): void {

    // Don't let the `N/A` column to be higher than all others
    // find max value and set `N/A` to just 1 more than that
    const first: number = this.frequencyMap.get(0.5);
    let max: number = 0;
    this.frequencyMap.forEach((value, key) => {
      if (key !== 0.5 && value > max) {
        max = value;
      }
    });
    if (first > max) {
      this.frequencyMap.set(0.5, max);
    }

    const scalar = 100 / max;

    this.frequencyMap.forEach((value, key) => {
      let finalValue = Math.round(value * scalar);
      if (finalValue !== 0 && finalValue < 10) {
        finalValue = 10; // makes sure the bar is at least visible -- 10 => 2px
      }
      this.frequencyMap.set(key, finalValue);
    });

    const finalResult: number[] = [
      this.frequencyMap.get(0.5),
      this.frequencyMap.get(1.5),
      this.frequencyMap.get(2.5),
      this.frequencyMap.get(3.5),
      this.frequencyMap.get(4.5),
      this.frequencyMap.get(5.5)
    ];

    this.finalStarMapBehaviorSubject.next(finalResult);
  }

}
