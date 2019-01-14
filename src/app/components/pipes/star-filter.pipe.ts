import { Pipe, PipeTransform } from '@angular/core';

import { StarFilterService } from './star-filter.service';

@Pipe({
  name: 'starFilterPipe'
})
export class StarFilterPipe implements PipeTransform {

  constructor(
    public starFilterService: StarFilterService
  ) { }

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
        this.starFilterService.addString(element.stars || 0.5);
      });

      this.starFilterService.computeFrequencyArray();

      // now actually filter stuff out

      return finalArray.filter((element) => {
        const currentStarValue: number = element.stars || 0.5;
        if ( currentStarValue > leftBound && currentStarValue < rightBound) {
          return true;
        } else {
          return false;
        }
      });
    }

    return finalArray;

  }

}
