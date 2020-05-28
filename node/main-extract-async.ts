// Code written by Cal2195
// Was originally added to `main-extract.ts` but was moved here for clarity

import { GLOBALS } from './main-globals';
import { ImageElement } from '../interfaces/final-object.interface';
import { extractThumbnails } from './main-extract';
import { sendCurrentProgress, insertTemporaryFieldsSingle, hasAllThumbs, hashFileAsync, createElement } from './main-support';

import * as path from 'path';

const async = require('async');
const thumbQueue = async.queue(nextExtaction, 1);

// WARNING - state variable hanging around!
let thumbsDone = 0;

thumbQueue.drain(() => {
  thumbsDone = 0;
  sendCurrentProgress(1, 1, 'done'); // indicates 100%
});

export function queueThumbExtraction(element: ImageElement) {
  thumbQueue.push(element);
}

function nextExtaction(element: ImageElement, callback) {
  const screenshotOutputFolder: string = path.join(GLOBALS.selectedOutputFolder, 'vha-' + GLOBALS.hubName);

  sendCurrentProgress(thumbsDone, thumbsDone + thumbQueue.length() + 1, 'importingScreenshots'); // check whether sending data off by 1
  thumbsDone++;

  extractThumbnails(
    element,
    GLOBALS.selectedSourceFolders[0].path, // HANDLE THIS BETTER !!!
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

// WARNING - state variables hanging around!
const metadataQueue = async.queue(checkForMetadata, 8);
let cachedFinalArray: ImageElement[] = [];
let deepScan = false;

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
    cachedFinalArray.forEach((element) => {
      if (element.partialPath === file.partialPath && element.fileName === file.name) {
        found = true;
      }
    });
    console.log('found: %s', found);
    if (found) {
      return callback();
    }
    createElement(file, '', callback);
  } else {
    hashFileAsync(file.fullPath).then((hash) => {
      cachedFinalArray.forEach((element) => {
        if (element.hash === hash) {
          found = true;
        }
      });
      console.log('found: %s', found);
      if (found) {
        return callback();
      }
      createElement(file, hash, callback);
    });
  }
}

/**
 *
 * @param inputDir
 * @param inputSource -- the number corresponding to the `inputSource` in ImageElement -- must be set!
 * @param finalArray
 * @param initalDeepScan
 */
export function startFileSystemWatching(
  inputDir: string,
  inputSource: number,
  finalArray: ImageElement[],
  initalDeepScan: boolean
) {

  cachedFinalArray = finalArray;
  deepScan = initalDeepScan; // Hash files instead of just path compare

  // One-liner for current directory
  const watcher = chokidar.watch('**', {
                                          ignored: '**/vha-*/**',
                                          cwd: inputDir,
                                          alwaysStat: true,
                                          awaitWriteFinish: true
                                        })
    .on('add', (path, stat) => {

      const ext = path.substring(path.lastIndexOf('.') + 1);
      if (path.indexOf('vha-') !== -1 || acceptableFiles.indexOf(ext) === -1) {
        console.log('ignoring %s', path);
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

}
