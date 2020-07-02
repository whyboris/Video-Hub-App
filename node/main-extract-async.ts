// Code written by Cal2195
// Was originally added to `main-extract.ts` but was moved here for clarity

import { GLOBALS } from './main-globals';
import { ImageElement, ImageElementPlus } from '../interfaces/final-object.interface';
import { extractAll } from './main-extract';
import { sendCurrentProgress, insertTemporaryFieldsSingle, hasAllThumbs, hashFileAsync, createElement } from './main-support';

import * as path from 'path';

const async = require('async');
const thumbQueue = async.queue(thumbQueueRunner, 1); // 1 is the number of threads

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

/**
 * Extraction queue runner
 * Runs for every element in the `thumbQueue`
 * @param element -- ImageElement to extract screenshots for
 * @param done    -- callback to indicate the current extraction finished
 */
function thumbQueueRunner(element: ImageElement, done) {
  const screenshotOutputFolder: string = path.join(GLOBALS.selectedOutputFolder, 'vha-' + GLOBALS.hubName);

  sendCurrentProgress(thumbsDone, thumbsDone + thumbQueue.length() + 1, 'importingScreenshots');      // check whether sending data off by 1
  thumbsDone++;                                                       // TODO -- rethink the whole `sendCurrentProgress` system from scratch

  extractAll(
    element,
    GLOBALS.selectedSourceFolders[element.inputSource].path,
    screenshotOutputFolder,
    GLOBALS.screenshotSettings,
    true,
    done
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
const metadataQueue = async.queue(metadataQueueRunner, 8); // 8 is the number of 'threads'

// Create maps where the value = 1 always.
// It is faster to check if key exists than searching through an array.
let alreadyInAngular: Map<string, number> = new Map(); // full paths to videos we have metadata for in Angular

let watcherMap: Map<number, FSWatcher> = new Map();
// ========================================================

export interface TempMetadataQueueObject {
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
export function sendNewVideoMetadata(imageElement: ImageElementPlus) {

  alreadyInAngular.set(imageElement.fullPath, 1);

  delete imageElement.fullPath;

  const elementForAngular = insertTemporaryFieldsSingle(imageElement);
  GLOBALS.angularApp.sender.send('new-video-meta', elementForAngular);


  // PROBABLY BETTER DONE ELSEWHERE !!!!
  const screenshotOutputFolder: string = path.join(GLOBALS.selectedOutputFolder, 'vha-' + GLOBALS.hubName);

  if (!hasAllThumbs(imageElement.hash, screenshotOutputFolder, GLOBALS.screenshotSettings.clipSnippets > 0 )) {
    queueThumbExtraction(imageElement);
  }
}

/**
 * Create element if not already present
 * @param fileInfo - various stat metadata about the file
 * @param callback
 */
export function metadataQueueRunner(fileInfo: TempMetadataQueueObject, callback) {

  console.log('metadata check:', fileInfo.fullPath);

  if (alreadyInAngular.has(fileInfo.fullPath)) {
    return callback();
  }
  console.log('not found, creating:');
  createElement(fileInfo, '', callback);

}

/**
 * Create a new `chokidar` watcher for a directory
 * @param inputDir
 * @param inputSource -- the number corresponding to the `inputSource` in ImageElement -- must be set!
 */
export function startFileSystemWatching(
  inputDir: string,
  inputSource: number
) {

  console.log('starting watcher ', inputSource);

  const watcherConfig = {
    ignored: '**/vha-*/**', // maybe ignore files that start with `._` ? WTF MAC!?
    cwd: inputDir,
    alwaysStat: true,
    awaitWriteFinish: true
  }

  // One-liner for current directory
  const watcher: FSWatcher = chokidar.watch('**', watcherConfig)
    .on('add', (filePath: string, stat) => {

      const ext = filePath.substring(filePath.lastIndexOf('.') + 1);
      if (filePath.indexOf('vha-') !== -1 || acceptableFiles.indexOf(ext) === -1) {
        // console.log('ignoring', path);
        return;
      }

      const subPath = ('/' + filePath.replace(/\\/g, '/')).replace('//', '/');
      const partialPath = subPath.substring(0, subPath.lastIndexOf('/'));
      const fileName = subPath.substring(subPath.lastIndexOf('/') + 1);
      const fullPath = path.join(inputDir, partialPath, fileName);

      console.log(fullPath);

      const newItem: TempMetadataQueueObject = {
        fullPath: fullPath,
        inputSource: inputSource,
        name: fileName,
        partialPath: partialPath,
        stat: stat,
      }

      metadataQueue.push(newItem);
    })
/*
    .on('all', (event, filePath) => {
      console.log(event, filePath);
    })
*/
    .on('ready', () => {
      console.log('All files scanned:', inputSource);
      console.log('not doing anything else -- NOT watching for changes!?!!');
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

  finalArray.forEach((element: ImageElement) => {
    const fullPath: string = path.join(
      GLOBALS.selectedSourceFolders[element.inputSource].path,
      element.partialPath,
      element.fileName
    );
    console.log(fullPath);

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
    });
  }
}

/**
 * Start old watcher
 * happens when user toggles the `watch` near folder
 * @param inputSource
 * @param folderPath
 */
export function startWatcher(inputSource: number, folderPath): void {
  console.log('start watching !!!!', inputSource, folderPath);

  GLOBALS.selectedSourceFolders[inputSource] = {
    path: folderPath,
    watch: true,
  }

  startFileSystemWatching(folderPath, inputSource);

}
