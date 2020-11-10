// async & chokidar Code written by Cal2195
// Was originally added to `main-extract.ts` but was moved here for clarity

const { powerSaveBlocker } = require('electron');
const async = require('async');
const chokidar = require('chokidar');
import * as path from 'path';
import { FSWatcher } from 'chokidar'; // probably the correct type for chokidar.watch() object
const fs = require('fs');

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
let metadataQueue;      // QueueObject
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
export function resetAllQueues() {

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

    const t1 = performance.now();
    console.log("META QUEUE took " + Math.round((t1 - metaExtractionStartTime) / 100) / 10 + " seconds.");
  });

  // Thumbs queue ======================================================================================================
  thumbsDone = 0;
  thumbExtractionStartTime = 0;

  thumbQueue = async.queue(thumbQueueRunner, 1); // 1 is the number of threads

  thumbQueue.drain(() => {

    const t1 = performance.now();
    console.log("THUMB QUEUE took " + Math.round((t1 - thumbExtractionStartTime) / 100) / 10 + " seconds.");

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
function thumbQueueRunner(element: ImageElement, done) {
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
function sendNewVideoMetadata(imageElement: ImageElementPlus) {

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
export function metadataQueueRunner(file: TempMetadataQueueObject, done) {

  if (metaExtractionStartTime === 0) {
    metaExtractionStartTime = performance.now();
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
 * Create a new `chokidar` watcher for a particular directory
 * @param inputDir
 * @param inputSource -- the number corresponding to the `inputSource` in ImageElement -- must be set!
 * @param persistent  -- whether to continue watching after the initial scan
 */
export function startFileSystemWatching(
  inputDir: string,
  inputSource: number,
  persistent: boolean
) {

  const t0 = performance.now();

  console.log('================================================================');

  console.log('starting watcher ', inputSource, typeof(inputSource), inputDir);

  GLOBALS.angularApp.sender.send('started-watching-this-dir', inputSource);

  const isNetworkAddress: boolean =    inputDir.startsWith('//')
                                    || inputDir.startsWith('\\');

  const watcherConfig = {
    cwd: inputDir,
    disableGlobbing: true,
    ignored: 'vha-*', // WARNING - dangerously ignores any path that includes `vha-` anywhere!!!
    persistent: persistent,
    usePolling: isNetworkAddress ? true : false,
  }

  const watcher: FSWatcher = chokidar.watch(inputDir, watcherConfig);

  const allAcceptableFiles: string[] = [...acceptableFiles, ...GLOBALS.additionalExtensions];

  metadataQueue.pause();
  thumbQueue.pause();

  watcher
    .on('add', (filePath: string) => {

      const ext = filePath.substring(filePath.lastIndexOf('.') + 1).toLowerCase();

      if (allAcceptableFiles.indexOf(ext) === -1) {
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

      const t1 = performance.now();
      console.log("Chokidar took " + Math.round((t1 - t0) / 100) / 10 + " seconds.");
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
        resolve();
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

  numberOfThumbsDeleted = 0;

  deleteThumbQueue.pause();

  const watcherConfig = {
    cwd: directory,
    persistent: false,
  }

  const watcher: FSWatcher = chokidar.watch(directory, watcherConfig)
    .on('add', (filePath: string) => {

      const parsedPath = path.parse(filePath);

      const ext = parsedPath.ext.substr(1); // remove the `.` from extension (e.g. `.jpg`)

      if (!['jpg', 'mp4'].includes(ext.toLowerCase())) {
        return; // non-jpg or non-mp4 file (not from VHA - do not delete!)
      }

      const fileNameHash = parsedPath.name;

      if (!hashesPresent.has(fileNameHash)) {
        const fullPath = path.join(directory, filePath);
        deleteThumbQueue.push(fullPath);
        numberOfThumbsDeleted++;
      }

    })
    .on('ready', () => {
      watcher.close().then(() => {
        deleteThumbQueue.resume();
        if (numberOfThumbsDeleted === 0) {
          GLOBALS.angularApp.sender.send('number-of-screenshots-deleted', 0);
        } // else only send message after the delete queue is finished
      });
    });

}

function deleteThumbQueueRunner(pathToFile: string, done) {
  console.log('deleting:', pathToFile);

  fs.unlink(pathToFile, (err) => {
    done();
  });
}

/**
 * Prevent PC from going to sleep during screenshot extraction
 */
export function preventSleep() {
  console.log('preventing sleep');
  preventSleepIds.push(powerSaveBlocker.start('prevent-app-suspension'));
};

/**
 * Allow PC to go to sleep after screenshots were extracted
 */
function allowSleep() {
  console.log('allowing sleep');
  if (preventSleepIds.length) {
    preventSleepIds.forEach((id: number) => {
      powerSaveBlocker.stop(id);
    });
  }
  preventSleepIds = [];
};
