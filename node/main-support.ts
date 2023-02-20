/*
 * This whole file is meant to contain only PURE functions
 *
 * There should be no side-effects of running any of them
 * They should depend only on their inputs and behave exactly
 * the same way each time they run no matter the outside state
 */

import type { VhaGlobals } from './main-globals';
import { GLOBALS } from './main-globals'; // TODO -- eliminate dependence on `GLOBALS` in this file!

import * as path from 'path';

const exec = require('child_process').exec;
const ffprobePath = require('@ffprobe-installer/ffprobe').path.replace('app.asar', 'app.asar.unpacked');
const fs = require('fs');
const hasher = require('crypto').createHash;
import type { Stats } from 'fs';

import type { FinalObject, ImageElement, ScreenshotSettings, InputSources, ResolutionString, StarRating} from '../interfaces/final-object.interface';
import { NewImageElement } from '../interfaces/final-object.interface';
import { startFileSystemWatching, resetWatchers } from './main-extract-async';

interface ResolutionMeta {
  label: ResolutionString;
  bucket: number;
}

export type ImportStage = 'importingMeta' | 'importingScreenshots' | 'done';

/**
 * Return an HTML string for a path to a file
 * e.g. `C:\Some folder` becomes `C:/Some%20folder`
 * @param anyOsPath
 */
export function getHtmlPath(anyOsPath: string): string {
  // Windows was misbehaving
  // so we normalize the path (just in case) and replace all `\` with `/` in this instance
  // because at this point Electron will be showing images following the path provided
  // with the `file:///` protocol -- seems to work
  const normalizedPath: string = path.normalize(anyOsPath);
  const forwardSlashes: string = normalizedPath.replace(/\\/g, '/');
  return forwardSlashes.replace(/ /g, '%20');
}

/**
 * Label the video according to closest resolution label
 * @param width
 * @param height
 */
function labelVideo(width: number, height: number): ResolutionMeta {
  let label: ResolutionString = '';
  let bucket = 0.5;
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
  } else if (width > 1280) {
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
 * Generate the file size formatted as ### MB or #.# GB
 * THIS CODE DUPLICATES THE CODE IN `file-size.pipe.ts`
 * @param fileSize
 */
function getFileSizeDisplay(sizeInBytes: number): string {
  if (sizeInBytes) {
    const rounded = Math.round(sizeInBytes / 1000000);
    return (rounded > 999
              ? (rounded / 1000).toFixed(1) + ' GB'
              : rounded + ' MB');
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
function countFoldersInFinalArray(imagesArray: ImageElement[]): number {
  const finalArrayFolderMap: Map<string, number> = new Map;
  imagesArray.forEach((element: ImageElement) => {
    if (!finalArrayFolderMap.has(element.partialPath)) {
      finalArrayFolderMap.set(element.partialPath, 1);
    }
  });
  return finalArrayFolderMap.size;
}

/**
 * Mark element as `deleted` (to remove as duplicate) if the previous element is identical
 * expect `alphabetizeFinalArray` to run first - so as to only compare adjacent elements
 * Unsure how duplicates can creep in to `ImageElement[]`, but at least they will be removed
 *
 *  !!! WARNING - currently does not merge the `tags` arrays (or other stuff)
 *  !!!           so tags and metadata could be lost :(
 *
 * @param imagesArray
 */
function markDuplicatesAsDeleted(imagesArray: ImageElement[]): ImageElement[] {

  let currentElement: ImageElement = NewImageElement();

  imagesArray.forEach((element: ImageElement) => {
    if (
         element.fileName    === currentElement.fileName
      && element.partialPath === currentElement.partialPath
      && element.inputSource === currentElement.inputSource
    ) {
      element.deleted = true;
      console.log('DUPE FOUND: ' + element.fileName);
    }
    currentElement = element;
  });

  return imagesArray;
}

/**
 * Write the final object into `vha` file
 *  -- this correctly alphabetizes all the videos
 *  -- it adds the correct number of folders in final array
 * @param finalObject   -- finalObject
 * @param pathToFile    -- the path with name of `vha` file to write to disk
 * @param done          -- function to execute when done writing the file
 */
export function writeVhaFileToDisk(finalObject: FinalObject, pathToTheFile: string, done): void {

  finalObject.images = finalObject.images.filter(element => !element.deleted);

  finalObject.images = stripOutTemporaryFields(finalObject.images);

  // remove any videos that have no reference (unsure how this could happen, but just in case)
  const allKeys: string[] = Object.keys(finalObject.inputDirs);
  finalObject.images = finalObject.images.filter(element => {
    return allKeys.includes(element.inputSource.toString());
  });

  finalObject.images = alphabetizeFinalArray(finalObject.images); // needed for `default` sort to show proper order
  finalObject.images = markDuplicatesAsDeleted(finalObject.images); // expects `alphabetizeFinalArray` to run first
  finalObject.images = finalObject.images.filter(element => !element.deleted); // remove any marked in above method

  finalObject.numOfFolders = countFoldersInFinalArray(finalObject.images);

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
    delete(element.selected);
  });
  return imagesArray;
}

/**
 * Format .pls file and write to hard drive
 * @param savePath -- location to save the temp.pls file
 * @param playlist -- array of ImageElements
 * @param done     -- callback
 */
export function createDotPlsFile(savePath: string, playlist: ImageElement[], sourceFolderMap: InputSources, done): void {

  const writeArray: string[] = [];

  writeArray.push('[playlist]');
  writeArray.push('NumberOfEntries=' + playlist.length);

  for (let i = 0; i < playlist.length; i++) {

    const fullPath: string = path.join(
      sourceFolderMap[playlist[i].inputSource].path,
      playlist[i].partialPath,
      playlist[i].fileName
    );

    writeArray.push('File' + (i + 1) + '=' + fullPath );
    writeArray.push('Title' + (i + 1) + '=' + playlist[i].cleanName);
  }

  writeArray.push(''); // empty line at the end requested by VLC Wiki

  const singleString: string = writeArray.join('\n');

  fs.writeFile(savePath, singleString, 'utf8', done);
}

/**
 * Clean up the displayed file name
 * (1) remove extension
 * (2) replace underscores with spaces            "_"   => " "
 * (3) replace periods with spaces                "."   => " "
 * (4) replace multi-spaces with a single space   "   " => " "
 * @param original {string}
 * @return {string}
 */
export function cleanUpFileName(original: string): string {
  return original.split('.').slice(0, -1).join('.')   // (1)
                 .split('_').join(' ')                // (2)
                 .split('.').join(' ')                // (3)
                 .split(/\s+/).join(' ');             // (4)
}

/**
 * Iterates ffprobe output to find stream with the best resolution (just width, for now)
 *
 * @param metadata  the ffProbe metadata object
 */
function getBestStream(metadata) {
  try {
    return metadata.streams.reduce((a, b) => a.width > b.width ? a : b);
  } catch (e) {
    // if metadata.streams is an empty array or something else is wrong with it
    // return an empty object so later calls to `stream.width` or `stream.height` do not throw exceptions
    return {};
  }
}

/**
 * Return the duration from file by parsing metadata
 * @param metadata
 */
function getFileDuration(metadata): number {
  if (metadata?.streams?.[0]?.duration) {

    return metadata.streams[0].duration;

  } else if (metadata?.format?.duration) {

    return   metadata.format.duration;
  } else {
    return 0;
  }
}

//Calculation of video bitrate in mb/s

function getBitrate(fileSize,duration){
  const bitrate = ((fileSize/1000)/duration)/1000;
  return Math.round(bitrate*100)/100;
}

/**
 * Return the average frame rate of files
 * ===========================================================================================
 *  TO SWITCH TO AVERAGE FRAME RATE,
 *  replace both instances of r_frame_rate with avg_frame_rate
 *  only in this method
 * ===========================================================================================
 * @param metadata
 */
 function getFps(metadata): number {
   if (metadata?.streams?.[0]?.r_frame_rate) {
     const fps = metadata.streams[0].r_frame_rate;
     const fpsParts = fps.split('/');
     const evalFps = Number(fpsParts[0]) / Number(fpsParts[1]); // FPS is a fraction like `24000/1001`
     return Math.round(evalFps);
   } else {
     return 0;
   }
 }

 // ===========================================================================================
 // Other supporting methods
 // ===========================================================================================

/**
 * Compute the number of screenshots to extract for a particular video
 * @param screenshotSettings
 * @param duration - number of seconds in a video
 */
function computeNumberOfScreenshots(screenshotSettings: ScreenshotSettings, duration: number): number {
  let total: number;

  // fixed or per minute
  if (screenshotSettings.fixed) {
    total = screenshotSettings.n;
  } else {
    total = Math.ceil(duration / 60 / screenshotSettings.n);
  }

  // never fewer than 3 screenshots
  if (total < 3) {
    total = 3;
  }

  // never more than would fit in a JPG
  const screenWidth: number = screenshotSettings.height * (16 / 9);
  if (total * screenWidth > 65535) {
    total = Math.floor(65535 / screenWidth);
  }

  // never more screenshots than seconds in a clip
  if (duration < total) {
    total = Math.max(2, Math.floor(duration));
  }

  return total;
}

/**
 * Hash a given file using its size
 * @param pathToFile  -- path to file
 * @param stats -- Stats from `fs.stat(pathToFile)`
 */
function hashFileAsync(pathToFile: string, stats: Stats): Promise<string> {
  return new Promise((resolve, reject) => {
    const sampleSize = 16 * 1024;
    const sampleThreshold = 128 * 1024;
    const fileSize = stats.size;
    let data: Buffer;

    if (fileSize < sampleThreshold) {
      fs.readFile(pathToFile, (err, data2) => {
        if (err) { throw err; }
        // append the file size to the data
        const buf = Buffer.concat([data2, Buffer.from(fileSize.toString())]);
        // make the magic happen!
        const hash = hasher('md5').update(buf.toString('hex')).digest('hex');
        resolve(hash);
      }); // too small, just read the whole file
    } else {
      data = Buffer.alloc(sampleSize * 3);
      fs.open(pathToFile, 'r', (err, fd) => {
        fs.read(fd, data, 0, sampleSize, 0, (err2, bytesRead, buffer) => { // read beginning of file
          fs.read(fd, data, sampleSize, sampleSize, Math.floor(fileSize / 2), (err3, bytesRead2, buffer2) => {
            fs.read(fd, data, sampleSize * 2, sampleSize, fileSize - sampleSize, (err4, bytesRead3, buffer3) => {
              fs.close(fd, (err5) => {
                // append the file size to the data
                const buf = Buffer.concat([data, Buffer.from(fileSize.toString())]);
                // make the magic happen!
                const hash = hasher('md5').update(buf.toString('hex')).digest('hex');
                resolve(hash);
              });
            });
          });
        });
      });
    }

  });
}

/**
 * Extracts information about a single file using `ffprobe`
 * Stores information into the ImageElement and returns it via callback
 * @param filePath              path to the file
 * @param screenshotSettings    ScreenshotSettings
 * @param callback
 */
export function extractMetadataAsync(
  filePath: string,
  screenshotSettings: ScreenshotSettings,
): Promise<ImageElement> {
  return new Promise((resolve, reject) => {
    const ffprobeCommand = '"' + ffprobePath + '" -of json -show_streams -show_format -select_streams V "' + path.normalize(filePath) + '"';

    exec(ffprobeCommand, (err, data, stderr) => {
      if (err) {
        reject();
      } else {
        const metadata = JSON.parse(data);
        const stream = getBestStream(metadata);
        const fileDuration = getFileDuration(metadata);
        const realFps = getFps(metadata);

        const duration = Math.round(fileDuration) || 0;
        const origWidth = stream.width || 0; // ffprobe does not detect it on some MKV streams
        const origHeight = stream.height || 0;

        fs.stat(filePath, (err2, fileStat) => {
          if (err2) {
            reject();
          }

          const imageElement = NewImageElement();
          imageElement.birthtime = Math.round(fileStat.birthtimeMs);
          imageElement.duration  = duration;
          imageElement.fileSize  = fileStat.size;
          imageElement.height    = origHeight;
          imageElement.mtime     = Math.round(fileStat.mtimeMs);
          imageElement.screens   = computeNumberOfScreenshots(screenshotSettings, duration);
          imageElement.width     = origWidth;
          imageElement.fps       = realFps;

          hashFileAsync(filePath, fileStat).then((hash) => {
            imageElement.hash = hash;
            resolve(imageElement);
          });

        });

      }
    });
  });
}

/**
 * Sends progress to Angular App
 * @param current number
 * @param total number
 * @param stage ImportStage
 */
export function sendCurrentProgress(current: number, total: number, stage: ImportStage): void {
  GLOBALS.angularApp.sender.send('import-progress-update', current, total, stage);
  if (stage !== 'done') {
    GLOBALS.winRef.setProgressBar(current / total);
  } else {
    GLOBALS.winRef.setProgressBar(-1);
  }
}

/**
 * Parse additional extension string
 * @param additionalExtension string
 */
export function parseAdditionalExtensions(additionalExtension: string): string[] {
  return additionalExtension.split(',').map((token => {
    return token.trim();
  }));
}

/**
 * Send final object to Angular; uses `GLOBALS` as input!
 * @param finalObject
 * @param globals
 */
export function sendFinalObjectToAngular(finalObject: FinalObject, globals: VhaGlobals): void {

  // finalObject.images = alphabetizeFinalArray(finalObject.images); // TODO -- check -- unsure if needed

  finalObject.images = insertTemporaryFields(finalObject.images);

  globals.angularApp.sender.send(
    'final-object-returning',
    finalObject,
    globals.currentlyOpenVhaFile,
    getHtmlPath(globals.selectedOutputFolder)
  );
}

/**
 * Writes / overwrites:
 *   unique index for default sort
 *   video resolution string
 *   resolution category for resolution filtering
 */
export function insertTemporaryFields(imagesArray: ImageElement[]): ImageElement[] {

  imagesArray.forEach((element, index) => {
    element = insertTemporaryFieldsSingle(element);
    element.index = index;                              // TODO -- rethink index -- maybe fix here ?
  });

  return imagesArray;
}

/**
 * Insert temporary fields but just for one file
 */
export function insertTemporaryFieldsSingle(element: ImageElement): ImageElement {
  // set resolution string & bucket
  const resolution: ResolutionMeta = labelVideo(element.width, element.height);
  element.durationDisplay = getDurationDisplay(element.duration);
  element.fileSizeDisplay = getFileSizeDisplay(element.fileSize);
  element.bitrate = getBitrate(element.fileSize, element.duration);
  element.resBucket = resolution.bucket;
  element.resolution = resolution.label;
  return element;
}

/**
 * If .vha2 version 2, create `inputDirs` from `inputDir` and add `inputSource` into every element
 * Keep `inputDir` for backwards compatibility - in case user wants to come back to VHA2
 * @param finalObject
 */
export function upgradeToVersion3(finalObject: FinalObject): void {
  if (finalObject.version === 2) {
    console.log('OLD version file -- converting!');
    finalObject.inputDirs = {
      0: {
        path: (finalObject as any).inputDir,
        watch: false
      }
    };
    finalObject.version = 3;
    finalObject.images.forEach((element: ImageElement) => {
      element.inputSource = 0;
      element.screens = computeNumberOfScreenshots(finalObject.screenshotSettings, element.duration);
      // update number of screens to account for too-many or too-few cases
      // as they were not handlede prior to version 3 release
    });
  }
}

/**
 * Only called when creating a new hub OR opening a hub
 * Notify Angular that a folder is 'connected'
 * If user wants continuous watching, watching directories with `chokidar`
 * @param inputDirs
 * @param currentImages -- if creating a new VHA file, this will be [] empty (and `watch` = false)
 */
export function setUpDirectoryWatchers(inputDirs: InputSources, currentImages: ImageElement[]): void {

  console.log('---------------------------------');
  console.log(' SETTING UP FILE SYSTEM WATCHERS' );
  console.log('---------------------------------');

  resetWatchers(currentImages);

  Object.keys(inputDirs).forEach((key: string) => {

    const pathToDir: string =    inputDirs[key].path;
    const shouldWatch: boolean = inputDirs[key].watch;

    console.log(key, 'watch =', shouldWatch, ':', pathToDir);

    // check if directory connected
    fs.access(pathToDir, fs.constants.W_OK, (err: any) => {

      if (!err) {
        GLOBALS.angularApp.sender.send('directory-now-connected', parseInt(key, 10), pathToDir);

        if (shouldWatch || currentImages.length === 0) {

          // Temp logging
          if (currentImages.length === 0) {
            console.log('FIRST SCAN');
          } else {
            console.log('PERSISTENT WATCHING !!!');
          }

          startFileSystemWatching(pathToDir, parseInt(key, 10), shouldWatch);
        }

      }

    });

  });
}
