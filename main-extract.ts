/**
 * This file contains all the logic for extracting:
 * first thumbnail,
 * full filmstrip,
 * the preview clip
 *
 * All the functions return a `Promise`
 *
 * All functions are PURE
 * The only exception is `extractFromTheseFiles`
 * which checks the global variable `globals.cancelCurrentImport`
 * in case it needs to not run
 *
 * Huge thank you to cal2195 for the code contribution
 * He implemented the efficient filmstrip and clip extraction!
 */

// ========================================================================================
//          Imports
// ========================================================================================

const fs = require('fs');

import * as path from 'path';

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path.replace('app.asar', 'app.asar.unpacked');

// sends data back as a stream as process runs
// requires an array of args
const spawn = require('child_process').spawn;
// sends all data back once the process exits in a buffer
// also spawns a shell (can pass a single cmd string)
const exec = require('child_process').exec;

import { globals } from './main-globals';

import { sendCurrentProgress } from './main-support';

import { ImageElement } from './src/app/components/common/final-object.interface';

// ========================================================================================
//          Promises
// ========================================================================================

/**
 * Check whether the input video file is still accessible
 *
 * @param pathToFile
 */
const checkIfInputFileExists = (pathToFile: string) => {
  return new Promise((resolve, reject) => {

    if (fs.existsSync(pathToFile)) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
};

/**
 * Check whether screenshots can be extracted from video file
 * To prevent erroring when file is corrupt
 *
 * @param pathToVideo
 * @param duration
 * @param numberOfScreenshots
 */
const checkAllScreensExist = (
  pathToVideo: string,
  duration: number,
  numberOfScreenshots: number,
) => {

  return new Promise((resolve, reject) => {

    const totalCount = numberOfScreenshots;
    const step: number = duration / (totalCount + 1);

    const check = (current) => {
      if (current === totalCount) {
        resolve(true);
      }
      // check for complete file
      const time = (current + 1) * step; // +1 so we don't pick the 0th frame
      const checkCommand = 'ffmpeg -v warning -ss ' + time + ' -t 1 -i "' + pathToVideo + '" -map V -f null -';
      const corruptRegex = /Output file is empty, nothing was encoded/g;
      exec(checkCommand, (err, data, stderr) => {
        console.log(data);
        console.log(stderr);
        if (err) {
          // skip this file
          console.log(pathToVideo + ' was corrupt, skipping!');
          resolve(false);
        } else {
          if (data.match(corruptRegex) || stderr.match(corruptRegex)) {
            // skip this file
            console.log(pathToVideo + ' was corrupt, skipping!');
            resolve(false);
          } else {
            check(current + 1);
          }
        }
      });
    };
    check(0);

  });

};

/**
 * Take N screenshots of a particular file
 * at particular file size
 * save as particular fileHash
 *
 * @param pathToVideo          -- full path to the video file
 * @param fileHash             -- hash of the video file
 * @param duration             -- duration of clip
 * @param screenshotHeight     -- height of screenshot in pixels (defaul is 100)
 * @param numberOfScreenshots  -- number of screenshots to extract
 * @param saveLocation         -- folder where to save jpg files
 */
const generateScreenshotStrip = (
  pathToVideo: string,
  fileHash: string,
  duration: number,
  screenshotHeight: number,
  numberOfScreenshots: number,
  saveLocation: string,
) => {

  return new Promise((resolve, reject) => {

    if (fs.existsSync(saveLocation + '/filmstrips/' + fileHash + '.jpg')) {
      console.log('thumbnails for ' + fileHash + ' already exist');
      resolve(true);
    }

    let current = 0;
    const totalCount = numberOfScreenshots;
    const step: number = duration / (totalCount + 1);
    const args = [];
    let allFramesFiltered = '';
    let outputFrames = '';

    // Hardcode a specific 16:9 ratio
    const ssWidth: number = screenshotHeight * (16 / 9);
    // const ssPadWidth: number = ssWidth + 2;
    const ratioString: string = ssWidth + ':' + screenshotHeight;
    // const ratioPadString: string = ssPadWidth + ':' + screenshotHeight;

    // sweet thanks to StackExchange!
    // https://superuser.com/questions/547296/resizing-videos-with-ffmpeg-avconv-to-fit-into-static-sized-player
    const fancyScaleFilter = 'scale='
                              + ratioString
                              + ':force_original_aspect_ratio=decrease,pad='
                              + ratioString + ':(ow-iw)/2:(oh-ih)/2';

    // make the magic filter
    while (current < totalCount) {
      const time = (current + 1) * step; // +1 so we don't pick the 0th frame
      args.push('-ss', time, '-i', pathToVideo);
      allFramesFiltered += '[' + current + ':V]' + fancyScaleFilter + '[' + current + '];';
      outputFrames += '[' + current + ']';
      current++;
    }
    args.push('-frames', 1,
      '-filter_complex', allFramesFiltered + outputFrames + 'hstack=inputs=' + totalCount,
      saveLocation + '/filmstrips/' + fileHash + '.jpg'
    );

    const ffmpeg_process = spawn(ffmpegPath, args);
    // Note from past Cal to future Cal:
    // ALWAYS READ THE DATA, EVEN IF YOU DO NOTHING WITH IT
    ffmpeg_process.stdout.on('data', function (data) {
      if (globals.debug) {
        console.log(data);
      }
    });
    ffmpeg_process.stderr.on('data', function (data) {
      if (globals.debug) {
        console.log('grep stderr: ' + data);
      }
    });
    ffmpeg_process.on('exit', () => {
      resolve(true);
    });

  });

};

/**
 * Generate the mp4 preview clip of the video file
 *
 * @param pathToVideo  -- full path to the video file
 * @param fileHash     -- hash of the video file
 * @param duration     -- duration of the original video file
 * @param screenshotHeight   -- resolution in pixels (defaul is 100)
 * @param saveLocation -- folder where to save jpg files
 */
const generatePreviewClip = (
  pathToVideo: string,
  fileHash: string,
  duration: number,
  screenshotHeight: number,
  saveLocation: string,
) => {

  return new Promise((resolve, reject) => {

    if (fs.existsSync(saveLocation + '/clips/' + fileHash + '.mp4')) {
      // console.log("thumbnails for " + fileHash + " already exist");
      resolve(true);
    }

    let current = 1;
    const totalCount = 10;
    const step: number = duration / totalCount;
    const args = [];
    let concat = '';

    // make the magic filter
    while (current < totalCount) {
      const time = current * step;
      const preview_duration = 1; // TODO: Make this customisable
      args.push('-ss', time, '-t', preview_duration, '-i', pathToVideo);
      concat += '[' + (current - 1) + ':V]' + '[' + (current - 1) + ':a]';
      current++;
    }
    concat += 'concat=n=' + (totalCount - 1) + ':v=1:a=1[v][a];[v]scale=-2:' + screenshotHeight + '[v2]';
    args.push('-filter_complex',
              concat,
              '-map',
              '[v2]',
              '-map',
              '[a]',
              saveLocation + '/clips/' + fileHash + '.mp4');
    // phfff glad that's over

    // now make it all worth it!
    const ffmpeg_process = spawn(ffmpegPath, args);
    // Note from past Cal to future Cal:
    // ALWAYS READ THE DATA, EVEN IF YOU DO NOTHING WITH IT
    ffmpeg_process.stdout.on('data', function (data) {
      if (globals.debug) {
        console.log(data);
      }
    });
    ffmpeg_process.stderr.on('data', function (data) {
      if (globals.debug) {
        console.log('grep stderr: ' + data);
      }
    });
    ffmpeg_process.on('exit', () => {
      resolve(true);
    });

  });

};

/**
 * Extract the first frame from the preview clip
 * @param saveLocation
 * @param fileHash
 */
const extractFirstFrame = (saveLocation: string, fileHash: string) => {

  return new Promise((resolve, reject) => {

    if (fs.existsSync(saveLocation + '/thumbnails/' + fileHash + '.jpg')) {
      resolve(true);
    }

    const args = [
      '-ss', 0,
      '-i', saveLocation + '/clips/' + fileHash + '.mp4',
      '-frames', 1,
      '-f', 'image2',
      saveLocation + '/thumbnails/' + fileHash + '.jpg',
    ];
    // console.log('extracting clip frame 1');
    const ffmpeg_process = spawn(ffmpegPath, args);
    // Note from past Cal to future Cal:
    // ALWAYS READ THE DATA, EVEN IF YOU DO NOTHING WITH IT
    ffmpeg_process.stdout.on('data', function (data) {
      if (globals.debug) {
        console.log(data);
      }
    });
    ffmpeg_process.stderr.on('data', function (data) {
      if (globals.debug) {
        console.log('grep stderr: ' + data);
      }
    });
    ffmpeg_process.on('exit', () => {
      resolve(true);
    });

  });

};

// ========================================================================================
//          Extraction engine
// ========================================================================================

/**
 * Start extracting screenshots now that metadata has been retreived and sent over to the app
 *
 * DANGEROUSLY DEPENDS ON a global variable `globals.cancelCurrentImport`
 * that can get toggled while scanning all screenshots
 *
 * @param theFinalArray     -- finalArray of ImageElements
 * @param videoFolderPath   -- path to base folder where videos are
 * @param screenshotFolder  -- path to folder where .jpg files will be saved
 * @param screenshotHeight  -- number in px how tall each screenshot should be
 * @param elementsToScan    -- array of indexes of elements in finalArray for which to extract screenshots
 */
export function extractFromTheseFiles(
  theFinalArray: ImageElement[],
  videoFolderPath: string,
  screenshotFolder: string,
  screenshotHeight: number,
  elementsToScan: number[]
): void {

  // final array already saved at this point - nothing to update inside it
  // just walk through `elementsToScan` to extract screenshots for elements in `theFinalArray`
  const itemTotal = elementsToScan.length;
  let iterator = -1; // gets incremented to 0 on first call

  const extractIterator = (): void => {
    iterator++;

    if ((iterator < itemTotal) && !globals.cancelCurrentImport) {

      sendCurrentProgress(iterator, itemTotal, 2);

      const currentElement = elementsToScan[iterator];

      const pathToVideo: string = (path.join(videoFolderPath,
        theFinalArray[currentElement].partialPath,
        theFinalArray[currentElement].fileName));

      const duration: number = theFinalArray[currentElement].duration;
      const fileHash: string = theFinalArray[currentElement].hash;
      const numOfScreens: number = theFinalArray[currentElement].screens;

      // use the Promises and .then INSTEAD !!!

      /*

       ORDER OF THINGS

      1. check if input file exists (accessible?)
      2. check if input file has all the screens available
      3. extract a SINGLE screenshot
      4. extract the FLIMSTRIP
      5. extract the CLIP

      (currently step 3 is last);

      iterate

       */

      checkIfInputFileExists(pathToVideo).
      then(content => {

        console.log('file extists = ' + content);

        return checkAllScreensExist(pathToVideo, duration, numOfScreens);

      }).then(content => {

        console.log('all screenshots present = ' + content);

        return generateScreenshotStrip(pathToVideo,
                                       fileHash,
                                       duration,
                                       screenshotHeight,
                                       numOfScreens,
                                       screenshotFolder);

      }).then(content => {

        console.log('filmstrip generated = ' + content);

        return generatePreviewClip(pathToVideo,
                                   fileHash,
                                   duration,
                                   screenshotHeight,
                                   screenshotFolder);

      }).then(content => {

        console.log('preview clip generated = ' + content);

        return extractFirstFrame(screenshotFolder, fileHash);

      }).then(content => {

        console.log('extracted first thumb = ' + content);

        // when all done with EVERYTHING
        extractIterator();

      });

    } else {
      sendCurrentProgress(1, 1, 0); // indicates 100%
    }
  };

  extractIterator();
}

/*
==============================================================
 TO DO LIST:

 make every method check if the file exists before writing --
 so as to not re-extract :)
==============================================================
*/
