import { Pipe, PipeTransform } from '@angular/core';

import { ResolutionFilterService, ResolutionString } from './resolution-filter.service';
import { ImageElement } from '../../../interfaces/final-object.interface';

@Pipe({
  name: 'resolutionFilterPipe'
})
export class ResolutionFilterPipe implements PipeTransform {

  constructor(
    public resolutionFilterService: ResolutionFilterService
  ) { }

  /**
   * Filter and show only videos that are within the resolution bounds
   * @param finalArray
   * @param render
   * @param leftBound
   * @param rightBound
   */
  transform(finalArray: ImageElement[], render?: boolean, leftBound?: number, rightBound?: number): ImageElement[] {

    if (render && finalArray.length > 0) {

      this.resolutionFilterService.resetMap();

      finalArray.forEach(element => {
        this.resolutionFilterService.addString(element.resBucket);
      });

      this.resolutionFilterService.computeFrequencyArray();

      // now actually filter stuff out

      return finalArray.filter((element) => {
        const currentResValue: number = element.resBucket;
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
