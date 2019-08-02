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
 * in case it needs to stop running (user interrupt)
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

import { globals, ScreenshotSettings } from './main-globals';

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

    // check for complete file
    const check = (current) => {
      if (current === totalCount) {
        resolve(true);
      }

      // !!!!!!
      // Notice this keeps running even after screenshots successfully extracted!
      // !!!!!!
      console.log('checking ' + current);

      const time = (current + 1) * step; // +1 so we don't pick the 0th frame
      const corruptRegex = /Output file is empty, nothing was encoded/g;

      const args = [
        '-v', 'warning', '-ss', time, '-t', '1', '-i', pathToVideo, '-map', 'V', '-f', 'null', '-',
      ];
      // console.log('extracting clip frame 1');
      const ffmpeg_process = spawn(ffmpegPath, args);
      // Note from past Cal to future Cal:
      // ALWAYS READ THE DATA, EVEN IF YOU DO NOTHING WITH IT
      ffmpeg_process.stdout.on('data', function (data) {
        if (globals.debug) {
          console.log(data);
          if (data.match(corruptRegex)) {
            // skip this file
            console.log(pathToVideo + ' was corrupt, skipping!');
            resolve(false);
          }
        }
      });
      ffmpeg_process.stderr.on('data', function (data) {
        if (globals.debug) {
          console.log('grep stderr: ' + data);
          if (data.match(corruptRegex)) {
            console.log(pathToVideo + ' was corrupt, skipping!');
            resolve(false);
          }
          resolve(false);
        }
      });
      ffmpeg_process.on('exit', () => {
        check(current + 1);
      });
    };
    // check(0);
    console.log('checkAllScreensExist is DISABLED !!!');
    resolve(true);

  });

};

/**
 * Extract a single frame from the original video (if screenshot not already present)
 * @param saveLocation
 * @param fileHash
 */
const extractSingleFrame = (
  pathToVideo: string,
  saveLocation: string,
  fileHash: string,
  screenshotHeight: number,
  duration: number
) => {

  return new Promise((resolve, reject) => {

    if (fs.existsSync(saveLocation + '/thumbnails/' + fileHash + '.jpg')) {
      resolve(true);
    }

    const ssWidth: number = screenshotHeight * (16 / 9);

    const args = [
      '-ss', duration / 10,
      '-i', pathToVideo,
      '-frames', 1,
      '-q:v', '2',
      '-vf', 'scale=w=' + ssWidth + ':h=' + screenshotHeight + ':force_original_aspect_ratio=decrease',
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


/**
 * Take N screenshots of a particular file
 * at particular file size
 * save as particular fileHash
 * (if filmstrip not already present)
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
 * (if clip is not already present)
 *
 * TODO -- allow user to change `totalCount` !!!!!!!
 *
 * @param pathToVideo  -- full path to the video file
 * @param fileHash     -- hash of the video file
 * @param duration     -- duration of the original video file
 * @param screenshotHeight   -- resolution in pixels (default is 100)
 * @param saveLocation -- folder where to save jpg files
 * @param clipSnippets -- number of clip snippets to extract
 */
const generatePreviewClip = (
  pathToVideo: string,
  fileHash: string,
  duration: number,
  screenshotHeight: number,
  saveLocation: string,
  clipSnippets: number,
  snippetLength: number
) => {

  return new Promise((resolve, reject) => {

    if (fs.existsSync(saveLocation + '/clips/' + fileHash + '.mp4')) {
      // console.log("thumbnails for " + fileHash + " already exist");
      resolve(true);
    }

    let current = 1;
    const totalCount = clipSnippets;
    const step: number = duration / totalCount;
    const args = [];
    let concat = '';

    // make the magic filter
    while (current < totalCount) {
      const time = current * step;
      const preview_duration = snippetLength;
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
 * (if the screenshot not already present)
 * @param saveLocation
 * @param fileHash
 */
const extractFirstFrame = (saveLocation: string, fileHash: string) => {

  return new Promise((resolve, reject) => {

    if (fs.existsSync(saveLocation + '/clips/' + fileHash + '.jpg')) {
      resolve(true);
    }

    const args = [
      '-ss', 0,
      '-i', saveLocation + '/clips/' + fileHash + '.mp4',
      '-frames', 1,
      '-f', 'image2',
      saveLocation + '/clips/' + fileHash + '.jpg',
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
 * Extract following this order
 *    1. check if input file exists (false -> extract next item)
 *    2. check if input file has all the screens available, that is not corrupt (false -> extract next item)
 *    3. extract the SINGLE screenshot
 *    4. extract the FLIMSTRIP
 *    5. extract the CLIP (if `clipSnippets` !== 0)
 *    6. extract the CLIP preview
 *
 * @param theFinalArray      -- finalArray of ImageElements
 * @param videoFolderPath    -- path to base folder where videos are
 * @param screenshotFolder   -- path to folder where .jpg files will be saved
 * @param screenshotSettings -- ScreenshotSettings object
 * @param elementsToScan     -- array of indexes of elements in finalArray for which to extract screenshots
 */
export function extractFromTheseFiles(
  theFinalArray: ImageElement[],
  videoFolderPath: string,
  screenshotFolder: string,
  screenshotSettings: ScreenshotSettings,
  elementsToScan: number[],
): void {

  const screenshotHeight: number = screenshotSettings.height;            // -- number in px how tall each screenshot should be
  const clipSnippets: number =     screenshotSettings.clipSnippets;      // -- number of clip snippets to extract; 0 == do not extract clip
  const snippetLength: number =    screenshotSettings.clipSnippetLength; // -- length of each snippet in the clip

  // final array already saved at this point - nothing to update inside it
  // just walk through `elementsToScan` to extract screenshots for elements in `theFinalArray`
  const itemTotal = elementsToScan.length;
  let iterator = -1; // gets incremented to 0 on first call

  const extractIterator = (): void => {
    iterator++;

    if ((iterator < itemTotal) && !globals.cancelCurrentImport) {

      sendCurrentProgress(iterator, itemTotal, 'importingScreenshots');

      const currentElement = elementsToScan[iterator];

      const pathToVideo: string = (path.join(videoFolderPath,
        theFinalArray[currentElement].partialPath,
        theFinalArray[currentElement].fileName));

      const duration: number = theFinalArray[currentElement].duration;
      const fileHash: string = theFinalArray[currentElement].hash;
      const numOfScreens: number = theFinalArray[currentElement].screens;

      checkIfInputFileExists(pathToVideo)

        .then(content => {
          console.log('01 - file extists = ' + content);

          if (content === false) {
            throw new Error('NOTPRESENT');
          }

          return checkAllScreensExist(pathToVideo, duration, numOfScreens);
        })

        .then(content => {
          console.log('02 - all screenshots present = ' + content);

          if (content === false) {
            throw new Error('FILE MIGHT BE CORRUPT');
          }

          return extractSingleFrame(
            pathToVideo, screenshotFolder, fileHash, screenshotHeight, duration
          );
        })

        .then(content => {
          console.log('03 - single screenshot extracted = ' + content);

          return generateScreenshotStrip(
            pathToVideo, fileHash, duration, screenshotHeight, numOfScreens, screenshotFolder
          );
        })

        .then(content => {
          console.log('04 - filmstrip generated = ' + content);

          if (clipSnippets === 0) {
            throw new Error('USER DOES NOT WANT CLIPS');
          }

          return generatePreviewClip(
            pathToVideo, fileHash, duration, screenshotHeight, screenshotFolder, clipSnippets, snippetLength
          );
        })

        .then(content => {
          console.log('05 - preview clip generated = ' + content);

          return extractFirstFrame(screenshotFolder, fileHash);
        })

        .then(content => {
          console.log('06 - extracted first thumb = ' + content);

          extractIterator(); // resume iterating
        })

        .catch((err) => {
          console.log('EXTRACTION ERROR: ' + err);
          extractIterator();
        });

    } else {
      sendCurrentProgress(1, 1, 'done'); // indicates 100%
    }
  };

  extractIterator();
}

// ========================================================================================
//         Helper method
// ========================================================================================

/**
 * Replace original file with new file
 * use ffmpeg to convert and letterbox to fit width and height
 *
 * @param oldFile
 * @param newFile
 * @param height
 */
export function replaceThumbnailWithNewImage(
  oldFile: string,
  newFile: string,
  height: number
) {

  return new Promise((resolve, reject) => {

    console.log('RESIZING !?!?!?!?');

    const width: number = Math.floor(height * (16 / 9));

    // desired command:
    // ffmpeg -y -i IN.png -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2" OUT.jpg

    const args = [
      '-y', '-i', newFile,
      '-vf', '"scale=' + width + ':' + height + ':force_original_aspect_ratio=decrease,' +
                'pad=' + width + ':' + height + ':(ow-iw)/2:(oh-ih)/2"',
      oldFile,
    ];

    console.log(ffmpegPath);
    console.log(args.join(' '));

    const ffmpeg_process = spawn(ffmpegPath, args);
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
      console.log('DONE');
      resolve(true);
    });

  });

}
