import { Pipe, PipeTransform } from '@angular/core';

import { ImageElement, StarRating } from '../common/final-object.interface';

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
   * Determine folder size and duration (simply sum up all the elements' properties)
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
    //                                                      sometimes this calculation results in NaN so we ^^^^^^^

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
   * @param prefixPath  whether to ONLY show folders
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
                                                                  //  - otherwise `1` and `1.5` coincide when you click `1`
          );
        });

      } else {
        subCopy = finalArray;
      }

      // Step 2: create a map from first subfolder within `prefixPath` to each element inside that subfolder
      const pathToElementsMap: Map<string, ImageElement[]> = new Map();

      subCopy.forEach((element) => {

        let firstFolder: string;

        if (prefixPath) {
          firstFolder = element.partialPath.replace(prefixPath, '');
        } else {
          // only grab the first subfolder
          // e.g.
          //    abc => abc
          //    abc/def => abc
          //    abc/def/xyz => abc
          firstFolder = element.partialPath.split('/')[1] || ''; // first element always empty element ?!?!?!?
        }

        if (pathToElementsMap.has(firstFolder)) {
          pathToElementsMap.set(firstFolder, [...pathToElementsMap.get(firstFolder), element]);
        } else {
          pathToElementsMap.set(firstFolder, [element]);
        }
      });

      // Step 3: create a new array to return filled with folders as ImageElements
      const arrWithFolders: ImageElement[] = [];

      // Step 4: append the UP folder if we're inside any folder
      if (prefixPath.length) {
        const upButton: ImageElement = {
          cleanName: '*FOLDER*',
          duration: 0,
          durationDisplay: '',
          fileName: '*UP*',
          fileSize: 0,
          fileSizeDisplay: '',
          hash: '',
          height: 0,
          index: 0,
          mtime: 0,
          partialPath: prefixPath.substring(0, prefixPath.lastIndexOf('/')),
          resBucket: 0,
          resolution: '',
          screens: 0,
          stars: 0.5,
          timesPlayed: 0,
          width: 0,
        };
        arrWithFolders.push(upButton);
      }

      // Step 5: convert the Map into ImageElements to display
      pathToElementsMap.forEach((value: ImageElement[], key: string) => {

        if (key === '') {
          arrWithFolders.push(...value); // spread out all files in current (root or `prefixPath`) folder
        } else {

          const folderProperties: FolderProperties = this.determineFolderProperties(value);

          const folderWithStuff: ImageElement = {
            cleanName: '*FOLDER*',
            duration: folderProperties.duration,
            durationDisplay: '',
            fileName: key.replace('/', ''),
            fileSize: folderProperties.byteSize,
            fileSizeDisplay: value.length.toString(),
            hash: this.extractFourPreviewHashes(value),
            height: 0,
            index: -1, // always show at the top (but after the `UP` folder) in the default view
            mtime: 0,
            partialPath: (prefixPath || '/') + key, // must set this for the folder click to register!
            resBucket: 0,
            resolution: '',
            screens: 0,
            stars: folderProperties.starAverage,
            timesPlayed: 0,
            width: 0,
          };
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
