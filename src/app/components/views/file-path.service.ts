import { Injectable } from '@angular/core';

import * as path from 'path';

type FolderType = 'thumbnails' | 'filmstrips' | 'clips';

@Injectable()
export class FilePathService {

  constructor() { }

  /**
   * Build the path based on the input
   * @param folderPath - path to where `vha-folder` is stored
   * @param hubName    - name of hub (to pick the correct `vha-folder` name)
   * @param subfolder  - whether `thumbnails`, `filmstrips`, or `clips`
   * @param hash       - file hash
   * @param video      - boolean -- if true then extension is `.mp4`
   */
  public createFilePath(folderPath: string, hubName: string, subfolder: FolderType, hash: string, video?: boolean): string {

    const fullPath: string = 'file://' + path.normalize(folderPath) +
                              '/' + 'vha-' + hubName.replace(/ /g, '%20') +
                              '/' + subfolder +
                              '/' + hash +
                              (video ? '.mp4' : '.jpg');

    return fullPath;
  }

}
