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
import { FinalObject, ImageElement } from './src/app/common/final-object.interface';
import { ResolutionString } from './src/app/pipes/resolution-filter.service';

interface ResolutionMeta {
  label: ResolutionString;
  bucket: number;
}

export type ImportStage = 'importingMeta' | 'importingScreenshots' | 'done';

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
export function countFoldersInFinalArray(imagesArray: ImageElement[]): number {  // TODO -- run this after rescan !!!!!?!!!!!!
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
  // TODO ? CATCH ERRORS ?

  // Restore the inputDir in case we removed it
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
 * Check if thumbnail, flimstrip, and clip is present
 * return boolean
 * @param fileHash           - unique identifier of the file
 * @param screenshotFolder   - path to where thumbnails are
 * @param shouldExtractClips - whether or not to extract clips
 */
export function hasAllThumbs(
  fileHash: string,
  screenshotFolder: string,
  shouldExtractClips: boolean
): boolean {
  return fs.existsSync(path.join(screenshotFolder, '/thumbnails/', fileHash + '.jpg'))
      && fs.existsSync(path.join(screenshotFolder, '/filmstrips/', fileHash + '.jpg'))
      && (shouldExtractClips ? fs.existsSync(path.join(screenshotFolder, '/clips/', fileHash + '.mp4')) : true);
}

/**
 * Generate indexes for any files missing thumbnails
 * @param fullArray          - ImageElement array
 * @param screenshotFolder   - path to where thumbnails are stored
 * @param shouldExtractClips - boolean -- whether user wants to extract clips or not
 */
export function missingThumbsIndex(
  fullArray: ImageElement[],
  screenshotFolder: string,
  shouldExtractClips: boolean
): number[] {
  const indexes: number[] = [];
  const total: number = fullArray.length;
  for (let i = 0; i < total; i++) {
    if (!hasAllThumbs(fullArray[i].hash, screenshotFolder, shouldExtractClips)) {
      indexes.push(i);
    }
  }

  return indexes;
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

      sendCurrentProgress(iterator, itemTotal, 'importingMeta');

      const filePathNEW = (path.join(videoFolderPath,
                                    theFinalArray[iterator].partialPath,
                                    theFinalArray[iterator].fileName));

      extractMetadataForThisONEFile(
        filePathNEW,
        screenshotSettings,
        theFinalArray[iterator],
        extractMetaDataCallback
      );

    } else {

      done(elementsWithMetadata);

    }
  };

  extractMetaDataCallback(null);
}

/**
 * Extracts information about a single file using `ffprobe`
 * Stores information into the ImageElement and returns it via callback
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

// ===========================================================================================
// TODO -- re-sort all the methods into some coherent grouping
// ===========================================================================================

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

  if (total < 3) {
    total = 3; // minimum 3 screenshots!
  }

  return total;
}

/**
 * Hash a given file using its size
 * @param pathToFile  -- path to file
 */
export function hashFile(pathToFile: string): string {
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
 * Sends progress to Angular App
 * @param current number
 * @param total number
 * @param stage ImportStage
 */
export function sendCurrentProgress(current: number, total: number, stage: ImportStage): void {
  console.log('Stage: ' + stage + ' - ' + current + ' / ' + total);
  globals.angularApp.sender.send('processingProgress', current, total, stage);
  if (stage !== 'done') {
    globals.winRef.setProgressBar(current / total);
  } else {
    globals.winRef.setProgressBar(-1);
  }
}
