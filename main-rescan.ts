/**
 *
 * This file should contain all and only the code relevant for the RESCAN functionality
 *
 */

import * as path from 'path';

const fs = require('fs');

import { hashFile, extractAllMetadata, sendCurrentProgress } from './main-support';

import { ImageElement } from './src/app/components/common/final-object.interface';
import { ScreenshotSettings } from './main-globals';


/**
 * Figures out what new files there are,
 * adds them to the finalArray,
 * and calls `extractAllMetadata`
 * (which will then send file home and start extracting images)
 * @param angularFinalArray       -- array of ImageElements from Angular - most current view
 * @param hdFinalArray            -- array of ImageElements from current hard drive scan
 * @param inputFolder             -- the input folder (where videos are)
 * @param screenshotSettings      -- ScreenshotSettings
 * @param extractMetadataCallback -- function for extractAllMetadata to call when done
 */
export function findAndImportNewFiles(
  angularFinalArray: ImageElement[],
  hdFinalArray: ImageElement[],
  inputFolder: string,
  screenshotSettings: ScreenshotSettings,
  extractMetadataCallback
): void {

  // Generate ImageElement[] of all the new elements to be added
  const onlyNewElements: ImageElement[] =
    findAllNewFiles(angularFinalArray, hdFinalArray, inputFolder);

  // Copy any metadata incase files were moved
  copyUserMetadata(angularFinalArray, onlyNewElements);

  // If there are new files
  if (onlyNewElements.length > 0) {

    const metaRescanStartIndex = angularFinalArray.length;
    const finalArrayUpdated = angularFinalArray.concat(onlyNewElements);

    extractAllMetadata(
      finalArrayUpdated,
      inputFolder,
      screenshotSettings,
      metaRescanStartIndex,
      extractMetadataCallback // actually = sendFinalResultHome
    );

  } else {
    sendCurrentProgress(1, 1, 'done'); // indicates 100%
  }

}

/**
 * Figures out what new files there are,
 * adds them to the finalArray,
 * figures out what files no longer exist,
 * removes them from finalArray,
 * deletes .jpg files from HD,
 * and calls `extractAllMetadata`
 * (which will then send file home and start extracting images)
 * @param angularFinalArray       -- array of ImageElements from Angular - most current view
 * @param hdFinalArray            -- array of ImageElements from current hard drive scan
 * @param inputFolder             -- the input folder (where videos are)
 * @param screenshotSettings      -- ScreenshotSettings
 * @param folderToDeleteFrom      -- path to folder where `.jpg` files are
 * @param extractMetadataCallback -- function for extractAllMetadata to call when done
 */
export function updateFinalArrayWithHD(
  angularFinalArray: ImageElement[],
  hdFinalArray: ImageElement[],
  inputFolder: string,
  screenshotSettings: ScreenshotSettings,
  folderToDeleteFrom: string,
  extractMetadataCallback
): void {

  // Generate ImageElement[] of all the new elements to be added
  const onlyNewElements: ImageElement[] =
    findAllNewFiles(angularFinalArray, hdFinalArray, inputFolder);

  // Copy any metadata incase files were moved
  copyUserMetadata(angularFinalArray, onlyNewElements);

  // remove from FinalArray all files that are no longer in the video folder
  const allDeletedRemoved: ImageElement[] =
    finalArrayWithoutDeleted(angularFinalArray, hdFinalArray, inputFolder, folderToDeleteFrom);

  // If there are new files OR if any files have been deleted !!!
  if (onlyNewElements.length > 0 || allDeletedRemoved.length < angularFinalArray.length) {

    const metaRescanStartIndex = allDeletedRemoved.length;
    const finalArrayUpdated = allDeletedRemoved.concat(onlyNewElements);

    extractAllMetadata(
      finalArrayUpdated,
      inputFolder,
      screenshotSettings,
      metaRescanStartIndex,
      extractMetadataCallback // actually = sendFinalResultHome
    );

  } else {
    sendCurrentProgress(1, 1, 'done'); // indicates 100%
  }

}


// ===========================================================================================
// Helper methods
// -------------------------------------------------------------------------------------------

/**
 * Update the entire array with new hashes
 *
 * @param imageArray
 * @param videoFolderPath
 */
export function updateArrayWithHashes(
  imageArray: ImageElement[],
  videoFolderPath: string
) {
  imageArray.forEach((element) => {
    const filePath = path.join(videoFolderPath, element.partialPath, element.fileName);
    element.hash = hashFile(filePath);
  });
}

/**
 * Find all the new files added to the source directory and return array of them
 * @param angularFinalArray  -- finalArray as it stands currently in the app
 * @param hdFinalArray  -- finalArray ais it stands on the Hard Drive (after scan)
 * @param inputFolder  -- location where all the videos are
 */
export function findAllNewFiles(
  angularFinalArray: ImageElement[],
  hdFinalArray: ImageElement[],
  inputFolder: string,
): ImageElement[] {

  const theDiff: ImageElement[] = [];

  hdFinalArray.forEach((newElement) => {
    let matchFound = false;
    angularFinalArray.forEach((oldElement) => {
      const pathStripped = newElement.partialPath.replace(inputFolder, '');
      if (pathStripped === oldElement.partialPath && newElement.fileName === oldElement.fileName) {
        matchFound = true;
        newElement.hash = oldElement.hash;
      }
    });

    if (!matchFound) { // means new element !!!
      const filePath = path.join(inputFolder, newElement.partialPath, newElement.fileName);
      newElement.hash = hashFile(filePath);
      theDiff.push(newElement);
    }
  });

  return theDiff;
}

/**
 * Clean up ImageElement[] coming from Angular, removing all elements for videos no longer on the Hard Drive
 * Also deletes all the .jpg images related to the video files that are no longer present
 * @param angularFinalArray  -- ImageElement[] representing what is currently in Angular
 * @param hdFinalArray -- ImageElement[] representing what is currently on the Hard Drive
 * @param inputFolder -- folder where the videos are located
 * @param folderWhereImagesAre -- folder where the images are located (for deletion)
 */
export function finalArrayWithoutDeleted(
  angularFinalArray: ImageElement[],
  hdFinalArray: ImageElement[],
  inputFolder: string,
  folderWhereImagesAre: string
): ImageElement[] {
  const cleanedArray: ImageElement[] = angularFinalArray.filter((value) => {
    let matchFound = false;
    let hashFound = false;

    hdFinalArray.forEach((newElement) => {
      if (value.hash === newElement.hash) {
        hashFound = true;
      }
      const pathStripped = newElement.partialPath.replace(inputFolder, '');
      if (pathStripped === value.partialPath && newElement.fileName === value.fileName) {
        matchFound = true;
      }
    });

    if (!hashFound) {
      deleteThumbnails(folderWhereImagesAre, value.hash);
    }
    if (matchFound) {
      return true;
    } else {
      return false;
    }
  });

  return cleanedArray;
}

/**
 * Delete thumbnails
 * @param imageLocation
 * @param hash
 */
export function deleteThumbnails(imageLocation: string, hash: string) {
  // console.log('deleting ' + hash);
  const files = [ imageLocation + '/filmstrips/' + hash + '.jpg',
                  imageLocation + '/clips/' + hash + '.mp4',
                  imageLocation + '/thumbnails/' + hash + '.jpg' ];

  files.forEach((file) => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file, (err) => {
        console.log(err);
        // Don't even sweat it dawg!
      });
      console.log('deleted ' + file);
    }
  });
}

/**
 * Returns true if there's user metadata to copy
 * @param element to check
 */
export function hasUserMetadata(
  element: ImageElement
) {
  return element.timesPlayed !== 0 ||
         element.stars !== 0.5 ||
         element.tags ||
         element.year;
}

/**
 * Copy all user metadata from oldElement to newElement
 * @param oldElement
 * @param newElement
 */
export function copyUserMetadataForFile(
  oldElement: ImageElement,
  newElement: ImageElement
) {
  console.log('copying for ' + oldElement.fileName);
  // TODO update this and above as needed
  newElement.stars = oldElement.stars;
  newElement.tags = oldElement.tags;
  newElement.timesPlayed = oldElement.timesPlayed;
  newElement.year = oldElement.year;
}

/**
 * Copy any user entered metadata from oldArray to newArray by hash key
 * @param oldArray to copy from
 * @param newArray to copy to
 */
export function copyUserMetadata(
  oldArray: ImageElement[],
  newArray: ImageElement[]
) {
  oldArray.forEach((oldElement) => {
    if (hasUserMetadata(oldElement)) {
      newArray.forEach((newElement) => {
        if (oldElement.hash === newElement.hash) {
          copyUserMetadataForFile(oldElement, newElement);
        }
      });
    }
  });
}


// ===========================================================================================
// RESCAN - ARCHIVED
// -------------------------------------------------------------------------------------------

/**
 * Regenerates the library,
 * figures out what files no longer exist,
 * deletes .jpg files from HD,
 * and calls `extractAllMetadata`
 * (which will then send file home and start extracting images)
 * @param angularFinalArray       -- array of ImageElements from Angular - most current view
 * @param hdFinalArray            -- array of ImageElements from current hard drive scan
 * @param inputFolder             -- the input folder (where videos are)
 * @param screenshotSettings      -- ScreenshotSettings
 * @param folderToDeleteFrom      -- path to folder where `.jpg` files are
 * @param extractMetadataCallback -- function for extractAllMetadata to call when done
 */
export function regenerateLibrary(
  angularFinalArray: ImageElement[],
  hdFinalArray: ImageElement[],
  inputFolder: string,
  screenshotSettings: ScreenshotSettings,
  folderToDeleteFrom: string,
  extractMetadataCallback
): void {

  updateArrayWithHashes(hdFinalArray, inputFolder);

  // Copy any user metadata
  copyUserMetadata(angularFinalArray, hdFinalArray);

  // Remove thumbnails no longer present
  finalArrayWithoutDeleted(angularFinalArray, hdFinalArray, inputFolder, folderToDeleteFrom);

  extractAllMetadata(
    hdFinalArray,
    inputFolder,
    screenshotSettings,
    0,
    extractMetadataCallback // actually = sendFinalResultHome
  );
}
