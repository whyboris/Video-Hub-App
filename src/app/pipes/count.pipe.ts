import { Pipe, PipeTransform } from '@angular/core';

import { ShowLimitService } from './show-limit.service';

import { ImageElement } from '../../../interfaces/final-object.interface';

@Pipe({
  name: 'countPipe'
})
export class CountPipe implements PipeTransform {

  constructor(
    public showLimitService: ShowLimitService
  ) { }

  /**
   * Return only items that match search string
   * @param finalArray
   */
  transform(finalArray: ImageElement[]): any {

    this.showLimitService.showResults(finalArray.length, finalArray.length);

    return finalArray;
  }

}
