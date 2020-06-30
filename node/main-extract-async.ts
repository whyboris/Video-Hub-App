// Code written by Cal2195
// Was originally added to `main-extract.ts` but was moved here for clarity

import { GLOBALS } from './main-globals';
import { ImageElement } from '../interfaces/final-object.interface';
import { extractThumbnails } from './main-extract';
import { sendCurrentProgress, insertTemporaryFieldsSingle, hasAllThumbs, hashFileAsync, createElement } from './main-support';

import * as path from 'path';

const async = require('async');
const thumbQueue = async.queue(nextExtraction, 1);

// ========================================================
// WARNING - state variable hanging around!
let thumbsDone = 0;
// ========================================================

thumbQueue.drain(() => {
  thumbsDone = 0;
  sendCurrentProgress(1, 1, 'done'); // indicates 100%   TODO - rethink `sendCurrentProgress` since we are using a new system for extraction
});

export function queueThumbExtraction(element: ImageElement) {
  thumbQueue.push(element);
}

function nextExtraction(element: ImageElement, callback) {
  const screenshotOutputFolder: string = path.join(GLOBALS.selectedOutputFolder, 'vha-' + GLOBALS.hubName);

  sendCurrentProgress(thumbsDone, thumbsDone + thumbQueue.length() + 1, 'importingScreenshots');      // check whether sending data off by 1
  thumbsDone++;                                                       // TODO -- rethink the whole `sendCurrentProgress` system from scratch

  extractThumbnails(
    element,
    GLOBALS.selectedSourceFolders[element.inputSource].path,
    screenshotOutputFolder,
    GLOBALS.screenshotSettings,
    true,
    callback
  );
}

// =========================================================================================================================================
// Code written by Cal2195
// Was originally added to `main-support.ts` bot was moved here for clarity

import { Stats } from 'fs';
import { acceptableFiles } from './main-filenames';

const chokidar = require('chokidar');
import { FSWatcher } from 'chokidar'; // probably the correct type for chokidar.watch() object

// ========================================================
// WARNING - state variables hanging around!
const metadataQueue = async.queue(checkForMetadata, 8);

let cachedFinalArray: ImageElement[] = []; // REMEMBER
let deepScan = false;

let watcherMap: Map<number, FSWatcher> = new Map();
// ========================================================

export interface TempMetadataQueueObject {
  deepScan: boolean;
  fullPath: string;
  inputSource: number;
  name: string;
  partialPath: string;
  stat: Stats;
}

/**
 * Send element back to Angular; if any screenshots missing, queue it for extraction
 * @param imageElement
 */
export function sendNewVideoMetadata(imageElement: ImageElement) {
  imageElement = insertTemporaryFieldsSingle(imageElement);

  GLOBALS.angularApp.sender.send('newVideoMeta', imageElement);

  imageElement.index = cachedFinalArray.length;

  cachedFinalArray.push(imageElement);

  const screenshotOutputFolder: string = path.join(GLOBALS.selectedOutputFolder, 'vha-' + GLOBALS.hubName);

  if (!hasAllThumbs(imageElement.hash, screenshotOutputFolder, GLOBALS.screenshotSettings.clipSnippets > 0 )) {
    queueThumbExtraction(imageElement);
  }
}

/**
 * Check if metadata is available
 * @param file
 * @param callback
 */
export function checkForMetadata(file: TempMetadataQueueObject, callback) {

  console.log('checking metadata for %s', file.fullPath);
  let found = false;

  if (!deepScan) {

    for (let i = 0; i < cachedFinalArray.length; i++) {
      const element = cachedFinalArray[i];
      if (element.partialPath === file.partialPath && element.fileName === file.name) { // consider comparing full path in case source folders overlap
        found = true;
        break;
      }
    }
    console.log('found: %s', found);

    if (found) {
      return callback();
    }

    createElement(file, '', callback);

  } else {

    hashFileAsync(file.fullPath).then((hash) => {

      for (let i = 0; i < cachedFinalArray.length; i++) {
        if (cachedFinalArray[i].hash === hash) {
          found = true;
          break;
        }
      }
      console.log('found: %s', found);

      if (found) {
        return callback();
      }

      createElement(file, hash, callback);

    });

  }
}

/**
 * Create a new `chokidar` watcher for a directory
 * @param inputDir
 * @param inputSource -- the number corresponding to the `inputSource` in ImageElement -- must be set!
 * @param initalDeepScan
 */
export function startFileSystemWatching(
  inputDir: string,
  inputSource: number,
  initalDeepScan: boolean
) {

  deepScan = initalDeepScan; // Hash files instead of just path compare

  console.log('starting watcher ', inputSource);

  // One-liner for current directory
  const watcher: FSWatcher = chokidar.watch('**', {
                                          ignored: '**/vha-*/**', // maybe ignore files that start with `._` ? WTF MAC!?
                                          cwd: inputDir,
                                          alwaysStat: true,
                                          awaitWriteFinish: true
                                        })
    .on('add', (path, stat) => {

      const ext = path.substring(path.lastIndexOf('.') + 1);
      if (path.indexOf('vha-') !== -1 || acceptableFiles.indexOf(ext) === -1) {
        // console.log('ignoring %s', path);
        return;
      }

      const subPath = ('/' + path.replace(/\\/g, '/')).replace('//', '/');
      const partialPath = subPath.substring(0, subPath.lastIndexOf('/'));
      const fileName = subPath.substring(subPath.lastIndexOf('/') + 1);
      const fullPath = inputDir + partialPath + '/' + fileName;

      console.log(fullPath);

      metadataQueue.push({
        deepScan: deepScan,
        fullPath: fullPath,
        inputSource: inputSource,
        name: fileName,
        partialPath: partialPath,
        stat: stat,
      });
    })
    // .on('all', (event, path) => {
    //   console.log('%s %s', event, path);
    // /*})*/
    .on('ready', () => {
      console.log('All files scanned. Watching for changes.');
      deepScan = false;
    });

    watcherMap.set(inputSource, watcher);

}

/**
 * Reset the cachedFinalArray
 * close out all the wathers
 * @param finalArray
 */
export function resetWatchers(finalArray: ImageElement[]): void {

  // close every old watcher
  Array.from(watcherMap.keys()).forEach((key: number) => {
    closeWatcher(key);
  });

  cachedFinalArray = finalArray;
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
    });
  }
}

/**
 * Start old watcher
 * happens when user toggles the `watch` near folder
 * @param inputSource
 * @param path
 */
export function startWatcher(inputSource: number, path): void {
  console.log('start watching !!!!', inputSource, path);

  GLOBALS.selectedSourceFolders[inputSource] = {
    path: path,
    watch: true,
  }

  startFileSystemWatching(path, inputSource, true);

}
