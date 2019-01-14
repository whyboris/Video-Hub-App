import { Pipe, PipeTransform } from '@angular/core';

import { StarFilterService } from './star-filter.service';

@Pipe({
  name: 'starFilterPipe'
})
export class StarFilterPipe implements PipeTransform {

  constructor(
    public starFilterService: StarFilterService
  ) {
    this.starRatingMap.set(0, 0.5);
    this.starRatingMap.set(1, 1.5);
    this.starRatingMap.set(2, 2.5);
    this.starRatingMap.set(3, 3.5);
  }

  starRatingMap: Map<number, number> = new Map();

  /**
   * Filter and show only videos that are within the resolution bounds
   * @param finalArray
   * @param render
   * @param leftBound
   * @param rightBound
   * @param forceUpdate -- dummy variable to trick the pure pipe into updating
   */
  transform(finalArray: any, render?: boolean, leftBound?: number, rightBound?: number, forceUpdate?: boolean): any {

    if (render && finalArray.length > 0) {

      this.starFilterService.resetMap();

      finalArray.forEach(element => {
        this.starFilterService.addString(element.stars);
      });

      this.starFilterService.computeFrequencyArray();

      // now actually filter stuff out

      return finalArray.filter((element) => {
        const currentResValue: number = this.starRatingMap.get(element.stars || 0); // if stars is undefined get the 0 value
        if ( currentResValue > leftBound && currentResValue < rightBound) {
          return true;
        } else {
          return false;
        }
      });
    }

    return finalArray;

  }

}
