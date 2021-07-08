// async & chokidar Code written by Cal2195
// Was originally added to `main-extract.ts` but was moved here for clarity

const { powerSaveBlocker } = require('electron');
const async = require('async');
const chokidar = require('chokidar');
import * as path from 'path';
import { FSWatcher } from 'chokidar'; // probably the correct type for chokidar.watch() object
const fs = require('fs');
import { fdir } from 'fdir';

import { GLOBALS } from './main-globals';

import { ImageElement, ImageElementPlus } from '../interfaces/final-object.interface';
import { acceptableFiles } from './main-filenames';
import { extractAll } from './main-extract';
import { sendCurrentProgress, insertTemporaryFieldsSingle, extractMetadataAsync, cleanUpFileName } from './main-support';

export interface TempMetadataQueueObject {
  fullPath: string;
  inputSource: number;
  name: string;
  partialPath: string;
}

// ONLY FOR LOGGING
const { performance } = require('perf_hooks');

// =====================================================================================================================
// The three queues will be `QueueObject` - https://caolan.github.io/async/v3/docs.html#QueueObject

// meta queue
let metadataQueue;      // QueueObject - accepts a `.push(TempMetadataQueueObject)`
let metaDone = 0;
let metaExtractionStartTime = 0;

// thumb queue
let thumbQueue;         // QueueObject
let thumbsDone = 0;
let thumbExtractionStartTime = 0;

// delete queue
let deleteThumbQueue;   // QueueObject
let numberOfThumbsDeleted: number = 0;

// =====================================================================================================================

// Create maps where the value = 1 always.
// It is faster to check if key exists than searching through an array.
let alreadyInAngular: Map<string, 1> = new Map(); // full paths to videos we have metadata for in Angular

// These two are together:
let watcherMap:       Map<number, FSWatcher> = new Map();
let allFoundFilesMap: Map<number, Map<string, 1>> = new Map();
// both these numbers     ^^^^^^ match up - they refer to the same `inputSource`

// =====================================================================================================================

// Miscellaneous
let preventSleepIds: number[] = []; // prevent and allow sleep

// =====================================================================================================================

resetAllQueues();

/**
 * Reset all three queues:
 *  - Meta queue
 *  - Thumb queue
 *  - Delet queue
 */
export function resetAllQueues(): void {

  allowSleep();

  // kill all previeous
  if (thumbQueue && typeof thumbQueue.kill === "function") {
    thumbQueue.kill();
  }
  if (metadataQueue && typeof metadataQueue.kill === "function") {
    metadataQueue.kill();
  }
  if (deleteThumbQueue && typeof deleteThumbQueue.kill === "function") {
    deleteThumbQueue.kill();
  }

  // Meta queue ========================================================================================================
  metaDone = 0;
  metaExtractionStartTime = 0;

  metadataQueue = async.queue(metadataQueueRunner, 1); // 1 is the number of parallel worker functions
                                                       // ^--- experiment with numbers to see what is fastest (try 8)

  metadataQueue.drain(() => {

    thumbQueue.resume();

    logPerformance("META QUEUE took ", metaExtractionStartTime);
  });

  // Thumbs queue ======================================================================================================
  thumbsDone = 0;
  thumbExtractionStartTime = 0;

  thumbQueue = async.queue(thumbQueueRunner, 1); // 1 is the number of threads

  thumbQueue.drain(() => {

    logPerformance("THUMB QUEUE took ", thumbExtractionStartTime);

    thumbsDone = 0;
    sendCurrentProgress(1, 1, 'done');
    console.log('thumbnail extraction complete!');
    allowSleep();
  });

  // Delete queue ======================================================================================================
  deleteThumbQueue = async.queue(deleteThumbQueueRunner, 1);

  deleteThumbQueue.drain(() => {
    console.log('all screenshots now deleted');
    GLOBALS.angularApp.sender.send('number-of-screenshots-deleted', numberOfThumbsDeleted);
  });
}

/**
 * Extraction queue runner
 * Runs for every element in the `thumbQueue`
 * @param element -- ImageElement to extract screenshots for
 * @param done    -- callback to indicate the current extraction finished
 */
function thumbQueueRunner(element: ImageElement, done): void {
  const screenshotOutputFolder: string = path.join(GLOBALS.selectedOutputFolder, 'vha-' + GLOBALS.hubName);
  const shouldExtractClips: boolean = GLOBALS.screenshotSettings.clipSnippets > 0;

  hasAllThumbs(element.hash, screenshotOutputFolder, shouldExtractClips)
    .then(() => {
      done();
    })
    .catch(() => {
      sendCurrentProgress(thumbsDone, thumbsDone + thumbQueue.length() + 1, 'importingScreenshots');  // TODO check whether sending data off by 1
      thumbsDone++;

      extractAll(
        element,
        GLOBALS.selectedSourceFolders[element.inputSource].path,
        screenshotOutputFolder,
        GLOBALS.screenshotSettings,
        true,
        done
      );
    });
}

/**
 * Send element back to Angular; if any screenshots missing, queue it for extraction
 * @param imageElement
 */
function sendNewVideoMetadata(imageElement: ImageElementPlus): void {

  alreadyInAngular.set(imageElement.fullPath, 1);

  delete imageElement.fullPath; // downgrade to `ImageElement` from `ImageElementPlus`

  const elementForAngular = insertTemporaryFieldsSingle(imageElement);
  GLOBALS.angularApp.sender.send('new-video-meta', elementForAngular);

  if (thumbExtractionStartTime === 0) {
    thumbExtractionStartTime = performance.now();
  }

  thumbQueue.push(imageElement);
}

/**
 * Create empty element, extract and update metadata, send over to Angular
 * @param fileInfo - various stat metadata about the file
 * @param done
 */
export function metadataQueueRunner(file: TempMetadataQueueObject, done): void {

  if (metaExtractionStartTime === 0) {
    metaExtractionStartTime = performance.now();
  }

  if (GLOBALS.demo && alreadyInAngular.size >= 50) {
    console.log(' - DEMO LIMIT REACHED - CANCELING SCAN !!!');
    sendCurrentProgress(50, 50, 'done');
    metadataQueue.kill();
    thumbQueue.resume();
    return;
  }

  sendCurrentProgress(metaDone, metaDone + metadataQueue.length() + 1, 'importingMeta');
  metaDone++;

  extractMetadataAsync(file.fullPath, GLOBALS.screenshotSettings)
    .then((imageElement: ImageElementPlus) => {
      imageElement.cleanName = cleanUpFileName(file.name);
      imageElement.fileName = file.name;
      imageElement.fullPath = file.fullPath; // insert this converting `ImageElement` to `ImageElementPlus`
      imageElement.inputSource = file.inputSource;
      imageElement.partialPath = file.partialPath;
      sendNewVideoMetadata(imageElement);
      done();
    }, () => {
      done(); // error, just continue
    });

}

/**
 * Use `fdir` to quickly generate file list and add it to `metadataQueue`
 * @param inputDir    -- full path to the input folder
 * @param inputSource -- the number corresponding to the `inputSource` in ImageElement -- must be set!
 */
function superFastSystemScan(inputDir: string, inputSource: number): void {

  GLOBALS.angularApp.sender.send('started-watching-this-dir', inputSource);

  metadataQueue.pause();
  thumbQueue.pause();

  const crawler = new fdir()
    .exclude((dir: string) => dir.startsWith('vha-')) // .exclude `dir` is the folder name, not full path
    .withFullPaths()
    .crawl(inputDir);

  const t0 = performance.now(); // LOGGING

  crawler.withPromise().then((files: string[]) => {

    // LOGGING =====================================================================================
    logPerformance("scan took ", t0);
    console.log('Found ', files.length, ' files in given directory');
    // =============================================================================================

    const allAcceptableFiles: string[] = [...acceptableFiles, ...GLOBALS.additionalExtensions];

    files.forEach((fullPath: string) => {

      const parsed = path.parse(fullPath);

      if (!allAcceptableFiles.includes(parsed.ext.substr(1).toLowerCase())) {
        return;
      }

      if (!allFoundFilesMap.has(inputSource)) {
        allFoundFilesMap.set(inputSource, new Map());
      }
      allFoundFilesMap.get(inputSource).set(fullPath, 1);

      if (alreadyInAngular.has(fullPath)) {
        return;
      }

      const partial: string = path.relative(inputDir, parsed.dir).replace(/\\/g, '/');

      const newItem: TempMetadataQueueObject = {
        fullPath: fullPath,
        inputSource: inputSource,
        name: parsed.base,
        partialPath: '/' + partial,
      }

      metadataQueue.push(newItem);

    });

    GLOBALS.angularApp.sender.send('all-files-found-in-dir', inputSource, allFoundFilesMap.get(inputSource));

    metadataQueue.resume();

  });

}

/**
 * Create a new `chokidar` watcher for a particular directory
 * @param inputDir    -- full path to input folder
 * @param inputSource -- the number corresponding to the `inputSource` in ImageElement -- must be set!
 * @param persistent  -- whether to continue watching after the initial scan
 */
export function startFileSystemWatching(inputDir: string, inputSource: number, persistent: boolean): void {

  // only run `chokidar` if `persistent`
  if (!persistent) {
    superFastSystemScan(inputDir, inputSource);
    return;
  }

  const t0 = performance.now();

  console.log('================================================================');
  console.log('SHOULD ONLY RUN ON PERSISTENT SCAN !!!');

  console.log('starting watcher ', inputSource, typeof(inputSource), inputDir);

  GLOBALS.angularApp.sender.send('started-watching-this-dir', inputSource);

  // WARNING - there are other ways to have a network address that are not accounted here !!!
  const isNetworkAddress: boolean =    inputDir.startsWith('//')
                                    || inputDir.startsWith('\\\\');

  const watcherConfig = {
    cwd: inputDir,
    disableGlobbing: true,
    ignored: 'vha-*', // WARNING - dangerously ignores any path that includes `vha-` anywhere!!!
    persistent: true, // NOTE: if `!persistent` we use `superFastSystemScan()` instead !!!
    usePolling: isNetworkAddress ? true : false,
  }

  const watcher: FSWatcher = chokidar.watch(inputDir, watcherConfig);

  const allAcceptableFiles: string[] = [...acceptableFiles, ...GLOBALS.additionalExtensions];

  metadataQueue.pause();
  thumbQueue.pause();

  watcher
    .on('add', (filePath: string) => {

      const ext = filePath.substring(filePath.lastIndexOf('.') + 1).toLowerCase();

      if (!allAcceptableFiles.includes(ext)) {
        return;
      }

      const subPath = ('/' + filePath.replace(/\\/g, '/')).replace('//', '/');
      const partialPath = subPath.substring(0, subPath.lastIndexOf('/'));
      const fileName = subPath.substring(subPath.lastIndexOf('/') + 1);
      const fullPath = path.join(inputDir, partialPath, fileName);

      if (!allFoundFilesMap.has(inputSource)) {
        allFoundFilesMap.set(inputSource, new Map());
      }
      allFoundFilesMap.get(inputSource).set(fullPath, 1);

      if (alreadyInAngular.has(fullPath)) {
        return;
      }

      const newItem: TempMetadataQueueObject = {
        fullPath: fullPath,
        inputSource: inputSource,
        name: fileName,
        partialPath: partialPath,
      }

      metadataQueue.push(newItem);
    })
    .on('unlink', (partialFilePath: string) => {    // note: this happens even when file is renamed!
      console.log(' !!! FILE DELETED, updating Angular:', partialFilePath);
      GLOBALS.angularApp.sender.send('single-file-deleted', inputSource, partialFilePath);
      // remove element from `alreadyInAngular`
      const basePath: string = GLOBALS.selectedSourceFolders[inputSource].path;
      alreadyInAngular.delete(path.join(basePath, partialFilePath));
      // note: there is no need to watch for `unlinkDir` since `unlink` fires for every file anyway!
    })
    .on('ready', () => {
      console.log('Finished scanning', inputSource);

      metadataQueue.resume();

      GLOBALS.angularApp.sender.send('all-files-found-in-dir', inputSource, allFoundFilesMap.get(inputSource));

      if (persistent) {
        console.log('^^^^^^^^ - CONTINUING to watch this directory!');
      } else {
        console.log('^^^^^^^^ - stopping watching this directory');
        watcher.close();  // chokidar seems to disregard `persistent` when `fsevents` is not enabled
      }

      logPerformance("Chokidar took ", t0);
    });

  watcherMap.set(inputSource, watcher);
}

/**
 * Close out all the wathers
 * reset the alreadyInAngular
 * @param finalArray
 */
export function resetWatchers(finalArray: ImageElement[]): void {

  // close every old watcher
  Array.from(watcherMap.keys()).forEach((key: number) => {
    closeWatcher(key);
  });

  alreadyInAngular = new Map();

  allFoundFilesMap = new Map();

  finalArray.forEach((element: ImageElement) => {
    const fullPath: string = path.join(
      GLOBALS.selectedSourceFolders[element.inputSource].path,
      element.partialPath,
      element.fileName
    );

    alreadyInAngular.set(fullPath, 1);
  });
}

/**
 * Close the old watcher
 * happens when opening a new hub (or user toggles the `watch` near folder)
 * @param inputSource
 */
export function closeWatcher(inputSource: number): void {
  console.log('stop watching', inputSource);
  if (watcherMap.has(inputSource)) {
    console.log('closing ', inputSource);
    watcherMap.get(inputSource).close().then(() => {
      console.log(inputSource, ' closed!');
      // do nothing
    });
  }
}

/**
 * Start old watcher
 * happens when user toggles the `watch` near folder
 * @param inputSource
 * @param folderPath
 */
export function startWatcher(inputSource: number, folderPath: string, persistent: boolean): void {
  console.log('start watching !!!!', inputSource, typeof(inputSource), folderPath, persistent);

  GLOBALS.selectedSourceFolders[inputSource] = {
    path: folderPath,
    watch: persistent,
  }

  preventSleep();
  startFileSystemWatching(folderPath, inputSource, persistent);
}

/**
 * Check if thumbnail, flimstrip, and clip is present
 * return boolean
 * @param fileHash           - unique identifier of the file
 * @param screenshotFolder   - path to where thumbnails are
 * @param shouldExtractClips - whether or not to extract clips
 */
function hasAllThumbs(
  fileHash: string,
  screenshotFolder: string,
  shouldExtractClips: boolean
): Promise<boolean> {
  return new Promise((resolve, reject) => {

    const thumb: string =     path.join(screenshotFolder, '/thumbnails/', fileHash + '.jpg');
    const filmstrip: string = path.join(screenshotFolder, '/filmstrips/', fileHash + '.jpg');
    const clip: string =      path.join(screenshotFolder, '/clips/',      fileHash + '.mp4');

    Promise.all([
      fs.promises.access(thumb, fs.constants.F_OK),
      fs.promises.access(filmstrip, fs.constants.F_OK),
      shouldExtractClips
        ? fs.promises.access(clip, fs.constants.F_OK)
        : 'ok'
    ])
      .then(() => {
        resolve(true);
      })
      .catch(() => {
        reject();
      });
  });
}

/**
 * Send all `imageElements` to the `thumbQueue`
 * @param fullArray          - ImageElement array
 */
export function extractAnyMissingThumbs(fullArray: ImageElement[]): void {
  preventSleep();
  fullArray.forEach((element: ImageElement) => {
    thumbQueue.push(element);
  });
}

/**
 * !!! WARNING !!! THIS FUNCTION WILL DELETE STUFF !!!
 *
 * Scan the provided directory and delete any file not in `hashesPresent`
 * @param hashesPresent
 * @param directory
 */
export function removeThumbnailsNotInHub(hashesPresent: Map<string, 1>, directory: string): void {

  deleteThumbQueue.pause();
  numberOfThumbsDeleted = 0;

  const crawler = new fdir()
    .withFullPaths()
    .filter((file: string) => {
      const  it: string = file.toLowerCase();
      return it.endsWith('.jpg') || it.endsWith('.mp4');
    })
    .crawl(directory);

  crawler.withPromise().then((files: string[]) => {

    files.forEach((file: string) => {
      const parsedPath = path.parse(file);
      const fileNameHash = parsedPath.name;

      if (!hashesPresent.has(fileNameHash)) {
        deleteThumbQueue.push(file);
        numberOfThumbsDeleted++;
      }
    });

    if (numberOfThumbsDeleted === 0) {
      GLOBALS.angularApp.sender.send('number-of-screenshots-deleted', 0);
    } else {
      deleteThumbQueue.resume(); // else only send message after the delete queue is finished
    }

  });

}

function deleteThumbQueueRunner(pathToFile: string, done): void {
  console.log('deleting:', pathToFile);

  fs.unlink(pathToFile, (err) => {
    done();
  });
}

/**
 * Prevent PC from going to sleep during screenshot extraction
 */
export function preventSleep(): void {
  console.log('preventing sleep');
  preventSleepIds.push(powerSaveBlocker.start('prevent-app-suspension'));
};

/**
 * Allow PC to go to sleep after screenshots were extracted
 */
function allowSleep(): void {
  console.log('allowing sleep');
  if (preventSleepIds.length) {
    preventSleepIds.forEach((id: number) => {
      powerSaveBlocker.stop(id);
    });
  }
  preventSleepIds = [];
};

function logPerformance(message: string, initial: number): void {
  console.log(message + Math.round((performance.now() - initial) / 100) / 10 + " seconds.");
}
