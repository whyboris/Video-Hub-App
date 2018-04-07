import { Pipe, PipeTransform } from '@angular/core';

import { ResolutionFilterService } from './resolution-filter.service';

@Pipe({
  name: 'resolutionFilterPipe'
})
export class ResolutionFilterPipe implements PipeTransform {

  constructor(
    public resolutionFilterService: ResolutionFilterService
  ) {
    this.resolutionMap.set('', 0.5);
    this.resolutionMap.set('720', 1.5);
    this.resolutionMap.set('720+', 1.5);
    this.resolutionMap.set('1080', 2.5);
    this.resolutionMap.set('1080+', 2.5);
    this.resolutionMap.set('4K', 3.5);
    this.resolutionMap.set('4K+', 3.5);
    // console.log(this.resolutionMap);
  }

  resolutionMap: Map<string, number> = new Map();

  /**
   * Filter and show only videos that are within the resolution bounds
   * @param finalArray 
   * @param render 
   * @param leftBound 
   * @param rightBound 
   */
  transform(finalArray: any, render?: boolean, leftBound?: number, rightBound?: number): any {

    if (render && finalArray.length > 0) {

      console.log('RESOLUTION FILTER RUNNING !!!');

      this.resolutionFilterService.resetMap();

      finalArray.forEach(element => {
        this.resolutionFilterService.addString(element[5]);
      });

      this.resolutionFilterService.computeFrequencyArray();

      // now actually filter stuff out

      return finalArray.filter((element) => {
        const currentResValue: number = this.resolutionMap.get(element[5]);
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
