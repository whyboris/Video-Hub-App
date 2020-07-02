// Code written by Cal2195
// Was originally added to `main-extract.ts` but was moved here for clarity

import { GLOBALS } from './main-globals';
import { ImageElement, ImageElementPlus, NewImageElement } from '../interfaces/final-object.interface';
import { extractAll } from './main-extract';
import { sendCurrentProgress, insertTemporaryFieldsSingle, hasAllThumbs, extractMetadataAsync, cleanUpFileName } from './main-support';

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
 * Create empty element, extract and update metadata, send over to Angular
 * @param fileInfo - various stat metadata about the file
 * @param done
 */
export function metadataQueueRunner(file: TempMetadataQueueObject, done) {

  const newElement = NewImageElement();
  extractMetadataAsync(file.fullPath, GLOBALS.screenshotSettings, newElement, file.stat)
    .then((imageElement: ImageElementPlus) => {
      imageElement.cleanName = cleanUpFileName(file.name);
      imageElement.fileName = file.name;
      imageElement.partialPath = file.partialPath;
      imageElement.inputSource = file.inputSource;
      imageElement.fullPath = file.fullPath; // insert this converting `ImageElement` to `ImageElementPlus`
      sendNewVideoMetadata(imageElement);
      done();
    }, () => {
      done(); // error, just continue
    });

}

/**
 * Create a new `chokidar` watcher for a directory
 * @param inputDir
 * @param inputSource -- the number corresponding to the `inputSource` in ImageElement -- must be set!
 * @param persistent  -- whether to continue watching after the initial scan
 */
export function startFileSystemWatching(
  inputDir: string,
  inputSource: number,
  persistent: boolean
) {

  console.log('starting watcher ', inputSource);

  const watcherConfig = {
    alwaysStat: true,
    awaitWriteFinish: true,
    cwd: inputDir,
    ignored: '**/vha-*/**', // maybe ignore files that start with `._` ? WTF MAC!?
    persistent: persistent,
  }

  // One-liner for current directory
  const watcher: FSWatcher = chokidar.watch('**', watcherConfig)
    .on('add', (filePath: string, stat) => {

      const ext = filePath.substring(filePath.lastIndexOf('.') + 1);

      if (filePath.indexOf('vha-') !== -1 || acceptableFiles.indexOf(ext) === -1) {
        return;
      }

      const subPath = ('/' + filePath.replace(/\\/g, '/')).replace('//', '/');
      const partialPath = subPath.substring(0, subPath.lastIndexOf('/'));
      const fileName = subPath.substring(subPath.lastIndexOf('/') + 1);
      const fullPath = path.join(inputDir, partialPath, fileName);

      console.log(fullPath);

      if (alreadyInAngular.has(fullPath)) {
        return;
      }

      console.log('not found, creating:');

      const newItem: TempMetadataQueueObject = {
        fullPath: fullPath,
        inputSource: inputSource,
        name: fileName,
        partialPath: partialPath,
        stat: stat,
      }

      metadataQueue.push(newItem);
    })
    .on('unlink', (filePath: string) => {
      console.log(' !!! FILE DELETED:', filePath);
      console.log('TODO - UPDATE ANGULAR');
    })
    .on('unlinkDir', (folderPath: string) => {
      console.log(' !!!!! DIRECTORY DELETED:', folderPath);
      console.log('TODO - UPDATE ANGULAR');
    })
/*
    .on('all', (event, filePath) => {
      console.log(event, filePath);
    })
*/
    .on('ready', () => {
      console.log('Finished scanning', inputSource);
      if (persistent) {
        console.log('^^^^^^^^ - CONTINUING to watch this directory!');
      } else {
        console.log('^^^^^^^^ - stopping watching this directory');
      }
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
export function startWatcher(inputSource: number, folderPath): void {
  console.log('start watching !!!!', inputSource, folderPath);

  GLOBALS.selectedSourceFolders[inputSource] = {
    path: folderPath,
    watch: true,
  }

  startFileSystemWatching(folderPath, inputSource, true);

}
