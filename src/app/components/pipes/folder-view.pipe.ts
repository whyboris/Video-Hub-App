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
   * @param finalArray
   * @param render      whether to insert folders
   * @param prefixPath  whether to ONLY show folders
   */
  transform(finalArray: ImageElement[], render: boolean, prefixPath?: string): ImageElement[] {

    if (render) {

      // console.log('prefix path is: ' + prefixPath);
      // console.log('INCOMING array length is: ' + finalArray.length);

      // to make things easier & faster:
      // first remove all elements not within the specific subfolder
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

      // console.log('subCopy length: ' + subCopy.length);

      // now create a MAP !!!
      // from `partialPath` to all the elements that have that path

      const pathToElementsMap: Map<string, ImageElement[]> = new Map();

      subCopy.forEach((element) => {

        let firstFolder: string;

        if (prefixPath) {
          firstFolder = element.partialPath.replace(prefixPath, '');
        } else {


          // only grab the first subfolder !!!
          // e.g.
          // abc => abc
          // abc/def => abc
          // abc/def/xyz => abc

          firstFolder = element.partialPath.split('/')[1] || ''; // first element always empty element ?!?!?!?
          // console.log(firstFolder);
        }
        // -- crap code can cause bugs                            ^^^^   ^^^^ to prevent undefined !?!!!

        if (pathToElementsMap.has(firstFolder)) {
          pathToElementsMap.set(firstFolder, [...pathToElementsMap.get(firstFolder), element]);
        } else {
          pathToElementsMap.set(firstFolder, [element]);
        }
      });

      // console.log(pathToElementsMap);

      // the array we'll return back !!!!
      const arrWithFolders: ImageElement[] = [];

      // append the UP folder if we're inside any folder !!!
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

      // now for each element in the map create the element to display!!!
      pathToElementsMap.forEach((value: ImageElement[], key: string) => {

        if (key === '') {
          arrWithFolders.push(...value); // spread out all files in root folder
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

      return arrWithFolders;

    } else {
      return finalArray;
    }
  }

}
