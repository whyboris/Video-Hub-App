import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ResolutionFilterService {

  frequencyMap: Map<number, number> = new Map();
  finalResolutionMapBehaviorSubject = new BehaviorSubject([]);

  /**
   * Reset the map to empty
   */
  public resetMap() {
    this.frequencyMap = new Map();
    this.frequencyMap.set(0.5, 0);
    this.frequencyMap.set(1.5, 0);
    this.frequencyMap.set(2.5, 0);
    this.frequencyMap.set(3.5, 0);
  }

  /**
   * Add each resolution to the map
   * @param resBucket
   */
  public addString(resBucket: number): void {
    let result: number;
    if (resBucket === undefined) {
      result = 0.5;
    } else {
      result = resBucket;
    }
    this.addResolution(result);
  }

  /**
   * Populate the frequency map
   * @param resolution
   */
  private addResolution(resolution: number): void {
    this.frequencyMap.set(resolution, this.frequencyMap.get(resolution) + 1);
  }

  /**
   * Get number of videos with the most frequent resolution
   */
  private getMostFrequent(): number {
    let largestFreq = 0;

    this.frequencyMap.forEach((value, key) => {
      if (value > largestFreq) {
        largestFreq = value;
      }
    });

    return largestFreq;
  }

  /**
   * Computes the array 9 objects long with most frequent words
   * Creates `height` property, scaled between 8 and 22 proportionally
   * calls `.next` on BehaviorSubject
   */
  public computeFrequencyArray(): void {

    // console.log(this.frequencyMap);

    const largestFrequency: number = this.getMostFrequent();
    // console.log(largestFrequency);

    const scalar = 100 / largestFrequency;

    this.frequencyMap.forEach((value, key) => {
      let finalValue = Math.round(value * scalar);
      if (finalValue !== 0 && finalValue < 10) {
        finalValue = 10; // makes sure the bar is at least visible -- 10 => 2px
      }
      this.frequencyMap.set(key, finalValue);
    });

    // console.log(this.frequencyMap);

    const finalResult: number[] = [
      this.frequencyMap.get(0.5),
      this.frequencyMap.get(1.5),
      this.frequencyMap.get(2.5),
      this.frequencyMap.get(3.5),
    ];

    // console.log(finalResult);
    this.finalResolutionMapBehaviorSubject.next(finalResult);
  }

}
