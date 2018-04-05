import { Pipe, PipeTransform } from '@angular/core';

import { ResolutionFilterService } from './resolution-filter.service';

@Pipe({
  name: 'resolutionFilterPipe'
})
export class ResolutionFilterPipe implements PipeTransform {

  constructor(
    public resolutionFilterService: ResolutionFilterService
  ) { }

  /**
   * Return only items that match search string
   * @param finalArray
   * @param render      whether to calculate the wordFrequency
   */
  transform(finalArray: any, render?: boolean): any {

    if (render && finalArray.length > 0) {

      console.log('RESOLUTION FILTER RUNNING !!!');

      this.resolutionFilterService.resetMap();

      finalArray.forEach(element => {
        this.resolutionFilterService.addString(element[5]);
      });

      this.resolutionFilterService.computeFrequencyArray();
    }

    return finalArray;

  }

}
