import { GLOBALS } from './main-globals';
import { ImageElement } from '../interfaces/final-object.interface';
import { extractThumbnails } from './main-extract';
import { sendCurrentProgress } from './main-support';

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
    callback);
}

