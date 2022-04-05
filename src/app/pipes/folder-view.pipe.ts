import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

import type { ImageElement, StarRating} from '@my/final-object.interface';
import { NewImageElement } from '@my/final-object.interface';
import type { SettingsButtonsType} from '../common/settings-buttons';
import { SettingsButtons } from '../common/settings-buttons';

interface FolderProperties {
  byteSize: number;    //                             corresponds to ImageElement `fileSize`
  duration: number;    // in seconds,                 corresponds to ImageElement `duration`
  mtime: number; //                                   corresponds to ImageElement `mtime`
  birthtime: number; //                                   corresponds to ImageElement `birthtime`
  starAverage: StarRating; // averaged weight of stars rounded to nearest `StarRating`
}


@Pipe({
  name: 'folderViewPipe'
})
export class FolderViewPipe implements PipeTransform {

  settingsButtons: SettingsButtonsType = SettingsButtons;
  /**
   * Determine folder size, duration, and average star rating (simply sum up / average the relevant ImageElement properties)
   * @param files
   */
  determineFolderProperties(files: ImageElement[]): FolderProperties {
    let totalFileSize = 0;
    let totalDuration = 0;
    let starAverage = 0;
    let totalStars = 0;
    let lastUpdated = 0;
    let firstCreated: number = Number.MAX_SAFE_INTEGER;

    files.forEach((element: ImageElement) => {
      totalFileSize += element.fileSize;
      totalDuration += element.duration;
      if (element.mtime > lastUpdated) {
        lastUpdated = element.mtime;
      }
      if (element.birthtime < firstCreated) {
        firstCreated = element.birthtime;
      }
      if (element.stars !== 0.5) {
        totalStars += 1;
        starAverage += element.stars;
      }
    });

    const starString: StarRating = <StarRating><unknown>((Math.round(starAverage / totalStars - 0.5) + 0.5) || 0.5).toString();
    //                         since `totalStars` can be 0, sometimes this calculation results in NaN so we ^^^^^^^

    return {
      byteSize: totalFileSize,
      duration: totalDuration,
      mtime: lastUpdated,
      birthtime: firstCreated,
      starAverage: starString,
    };
  }

  /**
   * Takes ImageElement array and returns 4 hashes
   * separated by `:` so the folderView has something to show!
   * @param files
   */
  extractFourPreviewHashes(files: ImageElement[]): string {
    let hashes = '';
    if (files.length > 4 && this.settingsButtons['randomizeFoldersScreenshots'].toggled) {
      hashes = this.extractRandomPreviewHashes(files);
    } else {
      hashes = this.extractFirstFourPreviewHashes(files);
    }
    if (hashes.charAt(0) === ':') {
      hashes = hashes.slice(1);
    }
    return hashes;
  }

  extractFirstFourPreviewHashes(files: ImageElement[]): string {
    let hashes = '';
    for (let n = 0; n < 4; n++) {
      if (files[n]) {
        hashes += ':' + files[n].hash;
      } else {
        break;
      }
    }
    return hashes;
  }

  extractRandomPreviewHashes(files: ImageElement[]): string {
    let hashes = '';
    for (let index = 0; index < 4; index++) {
      const randomIndex = Math.floor(Math.random() * files.length);
      hashes += ':' + files.splice(randomIndex, 1)[0].hash;
    }
    return hashes;
  }


  /**
   * Serves TWO important purposes:
   *  (1) to group all the videos in subdirectory into a folder - displaying 1 element in gallery
   *  (2) to allow user to navigate to a particular subfolder by clicking on it
   *      - must allow for an `UP` folder as well - to navigate backwards !!!
   *
   * The process has 6 steps:
   *  (1) create a subCopy (only elements that are within `prefixPath`)
   *  (2) create a Map (from first subfolder to every element within the subfolder)
   *  (3) create a new ImageElement[] to return back (empty at this stage)
   *  (4) insert `UP` folder if `prefixPath` exists
   *  (5) convert the Map into ImageElements to display (filling array from step 3)
   *  (6) return the newly-created ImageElement[]
   *
   * @param finalArray
   * @param render      whether to insert folders
   * @param prefixPath  current folder in view (full path to CWD - "current working directory")
   */
  transform(finalArray: ImageElement[], render: boolean, prefixPath?: string): ImageElement[] {

    if (render) {

      // Step 1: select subset of elments - only those within `prefixPath`
      let subCopy: ImageElement[] = [];

      if (prefixPath) {
        subCopy = finalArray.filter((element) => {
          return (
               element.partialPath === (prefixPath)               // needs to be exact
            || element.partialPath.startsWith(prefixPath + '/')   // or starts with exactly
          );
        });

      } else {
        subCopy = finalArray;
      }

      // Step 2: create a map from first subfolder within `prefixPath` to each element inside that subfolder
      const pathToElementsMap: Map<string, ImageElement[]> = new Map();
      // looks like:
      //   "" => Array(3)           <-- means 3 files in CWD
      //   "Folder1" => Array(25)   <-- means 25 files in subfolder named "Folder1"
      //   "Folder2" => Array(7)    <-- etc

      // Note we are always working with `.partialPath` which is always a folder path, never file name
      subCopy.forEach((element) => {

        let keyForMap: string;
        // can either be one of two:
        // (1) "" => points to array of elements directly inside "CWD"
        // (2) folder name => only folder immediately inside the "CWD" (Current Working Directory)

        if (prefixPath) {
          //   `remainingPath` is what is remaining after `prefixPath` has been removed
          const remainingPath: string = element.partialPath.replace(prefixPath, '');

          // If it includes `/` it means it is an element inside a sub-folder
          // we store it in the key for the bottom-most folder in "CWD"
          if (remainingPath.substring(1).includes('/')) {
            //             ^^^^^^^^^^^^^ make sure to remove the first character -- it is always `/`

            // first element may be nested, e.g. `/a/b/c`
            // if `prefixPath` is `a` the first folder should be `/b` not `/b/c`
            keyForMap = '/' + remainingPath.split('/')[1];

          } else {
            keyForMap = remainingPath;
          }

        } else {
          // only grab the first subfolder
          // e.g.
          //    abc         => abc
          //    abc/def     => abc
          //    abc/def/xyz => abc
          keyForMap = element.partialPath.split('/')[1] || '';
          // first element [0] always empty element ^^^ so we grab the second:
          // ("/abc").split('/') ==> ['', 'abc']
        }

        if (pathToElementsMap.has(keyForMap)) {
          pathToElementsMap.set(keyForMap, [...pathToElementsMap.get(keyForMap), element]);
        } else {
          pathToElementsMap.set(keyForMap, [element]);
        }
      });

      // Step 3: create a new array to return filled with folders as ImageElements
      const arrWithFolders: ImageElement[] = [];

      // Step 4: append the UP folder if we're inside any folder
      if (prefixPath.length) {
        const upButton: ImageElement = NewImageElement();

        upButton.cleanName   = '*FOLDER*';
        upButton.fileName    = '*UP*';
        upButton.partialPath = prefixPath.substring(0, prefixPath.lastIndexOf('/')),

        arrWithFolders.push(upButton);
      }

      // Step 5: convert the Map into ImageElements to display
      pathToElementsMap.forEach((value: ImageElement[], key: string) => {

        if (key === '') {
          arrWithFolders.push(...value); // spread out all files in current (root or `prefixPath`) folder
        } else {

          const folderProperties: FolderProperties = this.determineFolderProperties(value);

          const folderWithStuff: ImageElement = NewImageElement();

          folderWithStuff.cleanName       = '*FOLDER*',
          folderWithStuff.duration        = folderProperties.duration,
          folderWithStuff.fileName        = key.replace('/', ''),
          folderWithStuff.fileSize        = folderProperties.byteSize,
          folderWithStuff.fileSizeDisplay = value.length.toString(), // indicates the number of files in the folder!
          folderWithStuff.hash            = this.extractFourPreviewHashes(value),
          folderWithStuff.index           = -1, // always show at the top (but after the `UP` folder) in the default view
          folderWithStuff.mtime           = folderProperties.mtime,
          folderWithStuff.birthtime       = folderProperties.birthtime,
          folderWithStuff.partialPath     = (prefixPath || '/') + key, // must set this for the folder click to register!
          folderWithStuff.stars           = folderProperties.starAverage,

          arrWithFolders.push(folderWithStuff);
        }

      });

      // Step 6: return
      return arrWithFolders;

    } else {
      return finalArray;
    }
  }

}
