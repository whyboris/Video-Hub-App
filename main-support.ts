/*
 * This whole file is meant to contain only PURE functions
 *
 * There should be no side-effects of running any of them
 * They should depend only on their inputs and behave exactly
 * the same way each time they run no matter the outside state
 */

import * as path from 'path';

const fs = require('fs');

const hasher = require('crypto').createHash;

const exec = require('child_process').exec;

const ffprobePath = require('@ffprobe-installer/ffprobe').path.replace('app.asar', 'app.asar.unpacked');

import { acceptableFiles } from './main-filenames';
import { globals, ScreenshotSettings } from './main-globals';
import { FinalObject, ImageElement } from './src/app/components/common/final-object.interface';
import { ResolutionString } from './src/app/components/pipes/resolution-filter.service';

interface ResolutionMeta {
  label: ResolutionString;
  bucket: number;
}

/**
 * Label the video according to cosest resolution label
 * @param width
 * @param height
 */
function labelVideo(width: number, height: number): ResolutionMeta {
  let label: ResolutionString = '';
  let bucket: number = 0.5;
  if (width === 3840 && height === 2160) {
    label = '4K';
    bucket = 3.5;
  } else if (width === 1920 && height === 1080) {
    label = '1080';
    bucket = 2.5;
  } else if (width === 1280 && height === 720) {
    label = '720';
    bucket = 1.5;
  } else if (width > 3840) {
    label = '4K+';
    bucket = 3.5;
  } else if (width > 1920) {
    label = '1080+';
    bucket = 2.5;
  } else if (width > 720) {
    label = '720+';
    bucket = 1.5;
  }

  return { label: label, bucket: bucket };
}

/**
 * Alphabetizes an array of `ImageElement`
 * prioritizing the folder, and then filename
 */
export function alphabetizeFinalArray(imagesArray: ImageElement[]): ImageElement[] {
  return imagesArray.sort((x: ImageElement, y: ImageElement): number => {
    const folder1: string = x.partialPath.toLowerCase();
    const folder2: string = y.partialPath.toLowerCase();
    const file1: string = x.fileName.toLowerCase();
    const file2: string = y.fileName.toLowerCase();

    if (folder1 > folder2) {
      return 1;
    } else if (folder1 === folder2 && file1 > file2) {
      return 1;
    } else if (folder1 === folder2 && file1 === file2) {
      return 0;
    } else if (folder1 === folder2 && file1 < file2) {
      return -1;
    } else if (folder1 < folder2) {
      return -1;
    }
  });
}

/**
 * Writes / overwrites:
 *   unique index for default sort
 *   video resolution string
 *   resolution category for resolution filtering
 */
export function insertTemporaryFields(imagesArray: ImageElement[]): ImageElement[] {

  imagesArray.forEach((element, index) => {

    // set resolution string & bucket
    const resolution: ResolutionMeta = labelVideo(element.width, element.height);
    element.durationDisplay = getDurationDisplay(element.duration);
    element.fileSizeDisplay = getFileSizeDisplay(element.fileSize);
    element.resBucket = resolution.bucket;
    element.resolution = resolution.label;

    // set index for default sorting
    element.index = index;
  });

  return imagesArray;
}

/**
 * Generate the file size formatted as XXXmb or X.Xgb
 * @param fileSize
 */
function getFileSizeDisplay(sizeInBytes: number): string {
  if (sizeInBytes) {
    const rounded = Math.round(sizeInBytes / 1000000);
    // tslint:disable-next-line:max-line-length
    return (rounded > 999 ? Math.round(rounded / 100) / 10 + 'gb' : rounded + 'mb');
  } else {
    return '';
  }
}

/**
 * Generate duration formatted as X:XX:XX
 * @param numOfSec
 */
function getDurationDisplay(numOfSec: number): string {

  if (numOfSec === undefined || numOfSec === 0) {
    return '';
  } else {
    const hh = (Math.floor(numOfSec / 3600)).toString();
    const mm = (Math.floor(numOfSec / 60) % 60).toString();
    const ss = (Math.floor(numOfSec) % 60).toString();

    return (hh !== '0' ? hh + ':' : '')
         + (mm.length !== 2 ? '0' + mm : mm)
         + ':'
         + (ss.length !== 2 ? '0' : '') + ss;
  }
}

/**
 * Count the number of unique folders in the final array
 */
export function countFoldersInFinalArray(imagesArray: ImageElement[]): number {
  const finalArrayFolderMap: Map<string, number> = new Map;
  imagesArray.forEach((element: ImageElement) => {
    if (!finalArrayFolderMap.has(element.partialPath)) {
      finalArrayFolderMap.set(element.partialPath, 1);
    }
  });
  return finalArrayFolderMap.size;
}

/**
 * Write the final object into `vha` file
 * @param finalObject   -- finalObject
 * @param pathToFile    -- the path with name of `vha` file to write to disk
 * @param done          -- function to execute when done writing the file
 */
export function writeVhaFileToDisk(finalObject: FinalObject, pathToTheFile: string, done): void {
  const inputDir = finalObject.inputDir;

  // check for relative paths
  if (finalObject.inputDir === path.parse(pathToTheFile).dir) {
    finalObject.inputDir = '';
  }

  finalObject.images = stripOutTemporaryFields(finalObject.images);

  const json = JSON.stringify(finalObject);

  // backup current file
  try {
    fs.renameSync(pathToTheFile, pathToTheFile + '.bak');
  } catch (err) {
    console.log('Error backup up file! Moving on...');
    console.log(err);
  }

  // write the file
  fs.writeFile(pathToTheFile, json, 'utf8', done);
  // CATCH ERRORS !?!!?!!

  // Restore the inputDir incase we removed it
  finalObject.inputDir = inputDir;
}

/**
 * Strip out all the temporary fields
 * @param imagesArray
 */
function stripOutTemporaryFields(imagesArray: ImageElement[]): ImageElement[] {
  imagesArray.forEach((element) => {
    delete(element.durationDisplay);
    delete(element.fileSizeDisplay);
    delete(element.index);
    delete(element.resBucket);
    delete(element.resolution);
  });
  return imagesArray;
}

/**
 * Clean up the displayed file name
 * (1) remove extension
 * (2) replace underscores with spaces
 * (3) replace periods with spaces
 * (4) tripple & double spaces become single spaces
 * @param original {string}
 * @return {string}
 */
function cleanUpFileName(original: string): string {
  let cleaned = original;
  cleaned = cleaned.split('.').slice(0, -1).join('.');   // (1)
  cleaned = cleaned.split('_').join(' ');                // (2)
  cleaned = cleaned.split('.').join(' ');                // (3)
  cleaned = cleaned.split('   ').join(' ');              // (4)
  cleaned = cleaned.split('  ').join(' ');               // (4)
  return cleaned;
}

/**
 * Check if path is to a file system reserved object or folder
 * @param thingy path to particular file / directory
 */
function fileSystemReserved(thingy: string): boolean {
  return (thingy.startsWith('$') || thingy === 'System Volume Information');
}

/**
 * walk the path and return array of `ImageElements`
 * @param sourceFolderPath
 */
export function getVideoPathsAndNames(sourceFolderPath: string): ImageElement[] {

  const finalArray: ImageElement[] = [];
  let elementIndex = 0;
  // ignore folders beginning with { '.', '_', 'vha-' }
  const folderIgnoreRegex = /^(\.|_|vha-).*/g;
  // ignore files beginning with { '.', '_' }
  const fileIgnoreRegex = /^(\.|_).*/g;

  // Recursively walk through a directory compiling ImageElements
  const walkSync = (dir, filelist) => {
    const files = fs.readdirSync(dir, {encoding: 'utf8', withFileTypes: true});

    files.forEach(function (file) {
      if (!fileSystemReserved(file.name)) {
        try {
          // if the item is a _DIRECTORY_
          if (file.isDirectory() && !file.name.match(folderIgnoreRegex)) {
            filelist = walkSync(path.join(dir, file.name), filelist);
          } else {
            const extension = file.name.split('.').pop();
            if (acceptableFiles.includes(extension.toLowerCase()) && !file.name.match(fileIgnoreRegex)) {
              // before adding, remove the redundant prefix: sourceFolderPath, and convert forward slashes into back slashes
              const partialPath = dir.replace(sourceFolderPath, '').replace(/\\/g, '/');
              // fil finalArray with 3 correct and 5 dummy pieces of data
              finalArray[elementIndex] = {
                cleanName: cleanUpFileName(file.name),
                duration: 0,
                durationDisplay: '',
                fileName: file.name,
                fileSize: 0,
                fileSizeDisplay: '',
                hash: '',
                height: 0,
                index: 0,
                mtime: 0,
                partialPath: partialPath,
                resBucket: 0,
                resolution: '',
                screens: 10, // hardcoded default
                stars: 0.5,
                timesPlayed: 0,
                width: 0,
              };
              elementIndex++;
            }
          }
        } catch (err) {}
      }
    });

    return filelist;
  };

  walkSync(sourceFolderPath, []);

  return finalArray;
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
 * Check if thumbnail, flimstrip, and clip is present
 * return boolean
 * @param fileHash
 * @param screenshotFolder
 */
export function hasAllThumbs(fileHash: string, screenshotFolder: string): boolean {
  // Check in reverse order for efficiency
  return fs.existsSync(screenshotFolder + '/thumbnails/' + fileHash + '.jpg')
      && fs.existsSync(screenshotFolder + '/clips/' + fileHash + '.mp4') // !!! TODO - TOGGLE with user's preference
      && fs.existsSync(screenshotFolder + '/filmstrips/' + fileHash + '.jpg');
}

/**
 * Generate indexes for any files missing thumbnails
 */
export function missingThumbsIndex(fullArray: ImageElement[], screenshotFolder: string): number[] {
  const indexes: number[] = [];
  const total: number = fullArray.length;
  for (let i = 0; i < total; i++) {
    if (!hasAllThumbs(fullArray[i].hash, screenshotFolder)) {
      indexes.push(i);
    }
  }

  return indexes;
}

/**
 * Generate indexes for each element in finalArray, e.g.
 * [0, 1, 2, 3, ..., n] where n = finalArray.length
 */
export function everyIndex(fullArray: ImageElement[]): number[] {
  const indexes: number[] = [];
  const total: number = fullArray.length;
  for (let i = 0; i < total; i++) {
    indexes.push(i);
  }

  return indexes;
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

// --------------------------------------------------------------------------------------------
// -- EXTRACT METADATA --
// --------------------------------------------------------------------------------------------

/**
 * Extract the meta data & store it in the final array
 * @param theFinalArray   -- ImageElement[] with dummy meta
 * @param videoFolderPath -- the full path to the base folder for video files
 * @param screenshotSettings -- ScreenshotSettings
 * @param metaStartIndex  -- the starting point in finalArray from where to extract metadata
 *                           (should be 0 when first scan, should be index of first element when rescan)
 * @param done            -- callback when done with all metadata extraction
 */
export function extractAllMetadata(
  theFinalArray: ImageElement[],
  videoFolderPath: string,
  screenshotSettings: ScreenshotSettings,
  metaStartIndex: number,
  done: any
): void {

  const itemTotal = theFinalArray.length;
  let iterator = metaStartIndex;

  let elementsWithMetadata: ImageElement[] = [];

  if (metaStartIndex !== 0) { // if not a fresh scan
    elementsWithMetadata = theFinalArray.slice(0, metaStartIndex); // keep those elements that have metadata
  }

  const extractMetaDataCallback = (element: ImageElement | null): void => {

    if (element !== null) {
      iterator++;
      elementsWithMetadata.push(element);
    }

    if (iterator < itemTotal) {

      sendCurrentProgress(iterator, itemTotal, 1);

      const filePathNEW = (path.join(videoFolderPath,
                                    theFinalArray[iterator].partialPath,
                                    theFinalArray[iterator].fileName));

      extractMetadataForThisONEFile(filePathNEW, screenshotSettings, theFinalArray[iterator], extractMetaDataCallback);

    } else {

      done(elementsWithMetadata);

    }
  };

  extractMetaDataCallback(null);
}

/**
 * Updates the finalArray with the metadata about one particualar requested file
 * Updates newLastScreenCounterNEW global variable !!!
 * @param filePath              path to the file
 * @param screenshotSettings    ScreenshotSettings
 * @param imageElement          index in array to update
 * @param callback
 */
function extractMetadataForThisONEFile(
  filePath: string,
  screenshotSettings: ScreenshotSettings,
  imageElement: ImageElement,
  extractMetaCallback: any
): void {
  const ffprobeCommand = '"' + ffprobePath + '" -of json -show_streams -show_format "' + filePath + '"';
  exec(ffprobeCommand, (err, data, stderr) => {
    if (err) {
      extractMetaCallback(imageElement);
    } else {
      const metadata = JSON.parse(data);

      const fileDuration = metadata.streams[0].duration || metadata.format.duration;

      const duration = Math.round(fileDuration) || 0;
      const origWidth = metadata.streams[0].width || 0; // ffprobe does not detect it on some MKV streams
      const origHeight = metadata.streams[0].height || 0;

      const stat = fs.statSync(filePath);

      imageElement.duration = duration;
      imageElement.fileSize = stat.size;
      imageElement.mtime = stat.mtimeMs;
      if (imageElement.hash === '') {
        imageElement.hash = hashFile(filePath);
      }
      imageElement.height = origHeight;
      imageElement.width = origWidth;
      imageElement.screens = computeNumberOfScreenshots(screenshotSettings, duration);

      extractMetaCallback(imageElement);
    }
  });
}

/**
 * Compute the number of screenshots to extract for a particular video
 * @param screenshotSettings
 * @param duration - number of seconds in a video
 */
function computeNumberOfScreenshots(screenshotSettings: ScreenshotSettings, duration: number): number {
  let total: number;
  if (screenshotSettings.fixed) {
    total = screenshotSettings.n;
  } else {
    total = Math.ceil(duration / 60 / screenshotSettings.n);
  }
  return total;
}
/**
 * Update the entire array with new hashes
 *
 * @param imageArray
 * @param videoFolderPath
 */
function updateArrayWithHashes(
  imageArray: ImageElement[],
  videoFolderPath: string
) {
  imageArray.forEach((element) => {
    const filePath = path.join(videoFolderPath, element.partialPath, element.fileName);
    element.hash = hashFile(filePath);
  });
}

/**
 * Hash a given file using its size
 * @param pathToFile  -- path to file
 */
function hashFile(pathToFile: string): string {
  const sampleSize = 16 * 1024;
  const sampleThreshold = 128 * 1024;
  const stats = fs.statSync(pathToFile);
  const fileSize = stats.size;

  let data: Buffer;
  if (fileSize < sampleThreshold) {
    data = fs.readFileSync(pathToFile); // too small, just read the whole file
  } else {
    data = Buffer.alloc(sampleSize * 3);
    const fd = fs.openSync(pathToFile, 'r');
    fs.readSync(fd, data, 0, sampleSize, 0);                                  // read beginning of file
    fs.readSync(fd, data, sampleSize, sampleSize, fileSize / 2);              // read middle of file
    fs.readSync(fd, data, sampleSize * 2, sampleSize, fileSize - sampleSize); // read end of file
    fs.closeSync(fd);  // if you don't close, you get `EMFILE: too many open files` error
  }

  // append the file size to the data
  const buf = Buffer.concat([data, Buffer.from(fileSize.toString())]);
  // make the magic happen!
  const hash = hasher('md5').update(buf.toString('hex')).digest('hex');
  return hash;

}

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
    sendCurrentProgress(1, 1, 0); // indicates 100%
  }

}

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
    sendCurrentProgress(1, 1, 0); // indicates 100%
  }

}

/**
 * Sends progress to Angular App
 * @param current number
 * @param total number
 * @param stage number -- 0 = done, 1 = meta, 2 = jpg
 */
export function sendCurrentProgress(current: number, total: number, stage: number): void {
  console.log('sending SCAN PROGRESS HOME' + current);
  globals.angularApp.sender.send('processingProgress', current, total, stage);
  if (stage !== 0) {
    globals.winRef.setProgressBar(current / total);
  } else {
    globals.winRef.setProgressBar(-1);
  }
}
