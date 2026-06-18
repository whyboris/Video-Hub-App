import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

import { SourceFolderService } from '../components/statistics/source-folder.service';

import type { ImageElement } from '../../../interfaces/final-object.interface';

@Pipe({
  standalone: false,
  name: 'hideOfflinePipe'
})
export class HideOfflinePipe implements PipeTransform {

  constructor(
    public sourceFolderService: SourceFolderService,
  ) {}

  /**
   * Return only items that match search string
   * @param finalArray
   * @param hideOffline    {boolean} hide any element that is offline (from folder that is "not connected")
   */
  transform(finalArray: ImageElement[], hideOffline: boolean): ImageElement[] {

    if (hideOffline) {
      return finalArray.filter(element => this.sourceFolderService.sourceFolderConnected[element.inputSource]);
    } else {
      return finalArray;
    }

  }

}
