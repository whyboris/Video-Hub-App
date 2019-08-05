import { Pipe, PipeTransform } from '@angular/core';

import { ImageElement, StarRating, NewImageElement } from '../common/final-object.interface';

interface FolderProperties {
  byteSize: number;    //                             corresponds to ImageElement `fileSize`
  duration: number;    // in seconds,                 corresponds to ImageElement `duration`
  starAverage: StarRating; // averaged weight of stars rounded to nearest `StarRating`
}


@Pipe({
  name: 'folderViewPipe'
})
export class FolderViewPipe implements PipeTransform {

  constructor() { }


  /**
   * Determine folder size, duration, and average star rating (simply sum up / average the relevant ImageElement properties)
   * @param files
   */
  determineFolderProperties(files: ImageElement[]): FolderProperties {
    let totalFileSize: number = 0;
    let totalDuration: number = 0;
    let starAverage: number = 0;
    let totalStars: number = 0;

    files.forEach((element: ImageElement) => {
      totalFileSize += element.fileSize;
      totalDuration += element.duration;
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
      starAverage: starString,
    };
  }

  /**
   * Takes ImageElement array and returns 4 hashes
   * separated by `:` so the folderView has something to show!
   * @param files
   */
  extractFourPreviewHashes(files: ImageElement[]): string {
    let hashes: string = '';

    for (let n = 0; n < 4; n++) {
      if (files[n]) {
        hashes += ':' + files[n].hash;
      } else {
        break;
      }
    }

    if (hashes.charAt(0) === ':') {
      hashes = hashes.slice(1);
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
          folderWithStuff.fileSizeDisplay = value.length.toString(),
          folderWithStuff.hash            = this.extractFourPreviewHashes(value),
          folderWithStuff.index           = -1, // always show at the top (but after the `UP` folder) in the default view
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
