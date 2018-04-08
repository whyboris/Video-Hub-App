import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class ResolutionFilterService {

  frequencyMap: Map<string, number> = new Map();
  finalResolutionMapBehaviorSubject = new BehaviorSubject([]);

  constructor() { }

  /**
   * Reset the map to empty
   */
  public resetMap() {
    this.frequencyMap = new Map();
    this.frequencyMap.set('SD', 0);
    this.frequencyMap.set('720', 0);
    this.frequencyMap.set('1080', 0);
    this.frequencyMap.set('4K', 0);
  }

  /**
   * Add each resolution to the map
   * @param resolution
   */
  public addString(resolution: string): void {
    let result: string;
    if (resolution === '') {
      result = 'SD'
    } else if (resolution === '720' || resolution === '720+') {
      result = '720'
    } else if (resolution === '1080' || resolution === '1080+') {
      result = '1080'
    } else if (resolution === '4K' || resolution === '4K+') {
      result = '4K'
    }
    this.addResolution(result);
  }

  /**
   * Populate the frequency map
   * @param resolution
   */
  private addResolution(resolution: string): void {
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
      this.frequencyMap.get('SD'),
      this.frequencyMap.get('720'),
      this.frequencyMap.get('1080'),
      this.frequencyMap.get('4K'),
    ]; // array of objects

    // console.log(finalResult);
    this.finalResolutionMapBehaviorSubject.next(finalResult);
  }

}
