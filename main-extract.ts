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

// cool method to disable all console.log statements!
// console.log = function() {};

const { performance } = require('perf_hooks');

const fs = require('fs');

import * as path from 'path';

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path.replace('app.asar', 'app.asar.unpacked');

// sends data back as a stream as process runs
// requires an array of args
const spawn = require('child_process').spawn;
// sends all data back once the process exits in a buffer

import { globals, ScreenshotSettings } from './main-globals';

import { sendCurrentProgress } from './main-support';

import { ImageElement } from './interfaces/final-object.interface';

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
      return resolve(true);
    } else {
      return resolve(false);
    }
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
): Promise<boolean> => {

  return new Promise((resolve, reject) => {

    if (fs.existsSync(saveLocation + '/thumbnails/' + fileHash + '.jpg')) {
      return resolve(true);
    }

    const ssWidth: number = screenshotHeight * (16 / 9);

    const args: string[] = [
      '-ss', (duration / 10).toString(),
      '-i', pathToVideo,
      '-frames', '1',
      '-q:v', '2',
      '-vf', scaleAndPadString(ssWidth, screenshotHeight),
      saveLocation + '/thumbnails/' + fileHash + '.jpg',
    ];

     // On my computer it routinely takes 60 - 80ms to extract
    spawn_ffmpeg_and_run(args, 300, 'single screenshot')
    .then(success => {
      return resolve(success);
    })
    .catch(err => {
      console.log('what error?');
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
): Promise<boolean> => {

  return new Promise((resolve, reject) => {

    if (fs.existsSync(saveLocation + '/filmstrips/' + fileHash + '.jpg')) {
      console.log('thumbnails for ' + fileHash + ' already exist');
      return resolve(true);
    }

    let current = 0;
    const totalCount = numberOfScreenshots;
    const step: number = duration / (totalCount + 1);
    const args: string[] = [];
    let allFramesFiltered = '';
    let outputFrames = '';

    // Hardcode a specific 16:9 ratio
    const ssWidth: number = screenshotHeight * (16 / 9);

    const fancyScaleFilter: string = scaleAndPadString(ssWidth, screenshotHeight);

    // make the magic filter
    while (current < totalCount) {
      const time = (current + 1) * step; // +1 so we don't pick the 0th frame
      args.push('-ss', time.toString(), '-i', pathToVideo);
      allFramesFiltered += '[' + current + ':V]' + fancyScaleFilter + '[' + current + '];';
      outputFrames += '[' + current + ']';
      current++;
    }
    args.push('-frames', '1',
      '-filter_complex', allFramesFiltered + outputFrames + 'hstack=inputs=' + totalCount,
      saveLocation + '/filmstrips/' + fileHash + '.jpg'
    );

    // TODO -- make 3000 a function of # of screenshots
    spawn_ffmpeg_and_run(args, 3000, 'filmstrip')
    .then(success => {
      return resolve(success);
    })
    .catch(err => {
      console.log('what error?');
    });

  });

};

/**
 * Generate the mp4 preview clip of the video file
 * (if clip is not already present)
 *
 * @param pathToVideo   -- full path to the video file
 * @param fileHash      -- hash of the video file
 * @param duration      -- duration of the original video file
 * @param clipHeight    -- height of clip
 * @param saveLocation  -- folder where to save jpg files
 * @param clipSnippets  -- number of clip snippets to extract
 * @param snippetLength -- length in seconds of each snippet
 */
const generatePreviewClip = (
  pathToVideo: string,
  fileHash: string,
  duration: number,
  clipHeight: number,
  saveLocation: string,
  clipSnippets: number,
  snippetLength: number,
): Promise<boolean> => {

  return new Promise((resolve, reject) => {

    if (fs.existsSync(saveLocation + '/clips/' + fileHash + '.mp4')) {
      // console.log("thumbnails for " + fileHash + " already exist");
      return resolve(true);
    }

    let current = 1;
    const totalCount = clipSnippets;
    const step: number = duration / totalCount;
    const args: string[] = [];
    let concat = '';

    // make the magic filter
    while (current < totalCount) {
      const time = current * step;
      const preview_duration = snippetLength;
      args.push('-ss', time.toString(), '-t', preview_duration.toString(), '-i', pathToVideo);
      concat += '[' + (current - 1) + ':V]' + '[' + (current - 1) + ':a]';
      current++;
    }

    concat += 'concat=n=' + (totalCount - 1) + ':v=1:a=1[v][a];[v]scale=-2:' + clipHeight + '[v2]';
    args.push('-filter_complex',
              concat,
              '-map',
              '[v2]',
              '-map',
              '[a]',
              saveLocation + '/clips/' + fileHash + '.mp4');
    // phfff glad that's over

    // TODO - determine max length
    spawn_ffmpeg_and_run(args, 3000, 'clip')
    .then(success => {
      return resolve(success);
    })
    .catch(err => {
      console.log('what error?');
    });

  });

};

/**
 * Extract the first frame from the preview clip
 * (if the screenshot not already present)
 * @param saveLocation
 * @param fileHash
 */
const extractFirstFrame = (
  saveLocation: string,
  fileHash: string
): Promise<boolean> => {

  return new Promise((resolve, reject) => {

    if (fs.existsSync(saveLocation + '/clips/' + fileHash + '.jpg')) {
      return resolve(true);
    }

    const args: string[] = [
      '-ss', '0',
      '-i', saveLocation + '/clips/' + fileHash + '.mp4',
      '-frames', '1',
      '-f', 'image2',
      saveLocation + '/clips/' + fileHash + '.jpg',
    ];

    // TODO - confirm 300 ms is enough
    spawn_ffmpeg_and_run(args, 300, 'clip first frame')
    .then(success => {
      return resolve(success);
    })
    .catch(err => {
      console.log('what error?');
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
  const clipHeight: number =       screenshotSettings.clipHeight;       // -- whether clip should be half resolution of thumbnails

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

        .then((content: boolean) => {
          console.log('01 - video file extists = ' + content);

          if (content === false) {
            throw new Error('VIDEO FILE NOT PRESENT');
          }

          return extractSingleFrame(
            pathToVideo, screenshotFolder, fileHash, screenshotHeight, duration
          );
        })

        .then((content: boolean) => {
          console.log('02 - single screenshot extracted = ' + content);

          if (content === false) {
            throw new Error('SINGLE SCREENSHOT EXTRACTION TIMED OUT - LIKELY CORRUPT')
          }

          return generateScreenshotStrip(
            pathToVideo, fileHash, duration, screenshotHeight, numOfScreens, screenshotFolder
          );
        })

        .then((content: boolean) => {
          console.log('03 - filmstrip generated = ' + content);

          if (content === false) {
            throw new Error('CLIP GENERATION TIMED OUT - LIKELY CORRUPT')
          }

          if (clipSnippets === 0) {
            throw new Error('USER DOES NOT WANT CLIPS');
          }

          return generatePreviewClip(
            pathToVideo, fileHash, duration, clipHeight, screenshotFolder, clipSnippets, snippetLength
          );
        })

        .then((content: boolean) => {
          console.log('04 - preview clip generated = ' + content);

          return extractFirstFrame(screenshotFolder, fileHash);
        })

        .then((content: boolean) => {
          console.log('05 - extracted preview clip thumbnail = ' + content);

          extractIterator(); // resume iterating
        })

        .catch((err) => {
          console.log('EXTRACTION ERROR: ' + err);
          extractIterator(); // resume iterating
        });

    } else {
      sendCurrentProgress(1, 1, 'done'); // indicates 100%
    }
  };

  extractIterator();
}

// ========================================================================================
//         Helper methods
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

    console.log('Resizing new image and replacing old thumbnail');

    const width: number = Math.floor(height * (16 / 9));

    const args = [
      '-y', '-i', newFile,
      '-vf', scaleAndPadString(width, height),
      oldFile,
    ];

    // TODO - confirm 1s is enough
    spawn_ffmpeg_and_run(args, 1000, 'replacing thumbnail')
    .then(success => {
      return resolve(success);
    })
    .catch(err => {
      console.log('what error?');
    });

  });

}

/**
 * Generate the correct `scale=` & `pad=` string for ffmpeg
 * @param width
 * @param height
 */
function scaleAndPadString(width: number, height: number): string {
  // sweet thanks to StackExchange!
  // https://superuser.com/questions/547296/resizing-videos-with-ffmpeg-avconv-to-fit-into-static-sized-player

  return 'scale=w=' + width + ':h=' + height + ':force_original_aspect_ratio=decrease,' +
         'pad='     + width + ':'   + height + ':(ow-iw)/2:(oh-ih)/2';

}

/**
 * Spawn ffmpeg and run the appropriate arguments
 * Kill the process after maxRunningTime
 * @param args            args to pass into ffmpeg
 * @param maxRunningTime  maximum time to run ffmpeg
 * @param description     log for console.log
 */
function spawn_ffmpeg_and_run(
  args: string[],
  maxRunningTime: number,
  description: string
): Promise<boolean> {

  return new Promise((resolve, reject) => {

    const t0: number = performance.now();

    const ffmpeg_process = spawn(ffmpegPath, args);

    const killProcessTimeout = setTimeout(() => {
      if (!ffmpeg_process.killed) {
        ffmpeg_process.kill();
        console.log(description + ' KILLED EARLY');
        return resolve(false);
      }
    }, maxRunningTime);


    // Note from past Cal to future Cal:
    // ALWAYS READ THE DATA, EVEN IF YOU DO NOTHING WITH IT
    ffmpeg_process.stdout.on('data', data => {
      if (globals.debug) {
        console.log(data);
      }
    });
    ffmpeg_process.stderr.on('data', data => {
      if (globals.debug) {
        console.log('grep stderr: ' + data);
      }
    });
    ffmpeg_process.on('exit', () => {
      const t1: number = performance.now();
      console.log(description + ': ' + (t1 - t0).toString());
      clearTimeout(killProcessTimeout);
      return resolve(true);
    });

  })

}



// ========================================================================================
//         Disabled method
// ========================================================================================

/**
 * Check whether screenshots can be extracted from video file
 * To prevent erroring when file is corrupt
 *
 * Method currently disabled because it takes too long:
 * For 15 screenshots, it takes 1 - 6 seconds to check if the file is not corrupt
 * This is too long to wait during a regular extraction process
 * since 99% of the files will not be corrupt
 *
 * Furthermore, it does not seem to catch all corrupt files anyway
 *
 * The current solution is simply to kill every ffmpeg process after some time
 * in case it is stuck trying to parse an unparsable file
 *
 * Used to be after step 1 (checking video file still present)
 *
        //   return checkAllScreensExist(pathToVideo, duration, numOfScreens);
        // })

        // .then(content => {
        //   console.log('1.5 - all screenshots present = ' + content);

        //   if (content === false) {
        //     throw new Error('FILE MIGHT BE CORRUPT');
        //   }
 *
 * @param pathToVideo
 * @param duration
 * @param numberOfScreenshots
 */
const checkAllScreensExist__DISABLED = (
  pathToVideo: string,
  duration: number,
  numberOfScreenshots: number,
) => {

  return new Promise((resolve, reject) => {

    const t0: number = performance.now();

    const totalCount = numberOfScreenshots;
    const step: number = duration / (totalCount + 1);

    // check for complete file
    const check = (current: number): void => {
      if (current === totalCount) {
        console.log('resolving TRUE');

        const t1: number = performance.now();
        console.log('SS check: ' + (t1 - t0).toString());

        return resolve(true);
      }

      const time = (current + 1) * step; // +1 so we don't pick the 0th frame
      const corruptRegex = /Output file is empty, nothing was encoded/g;

      const args = [
        '-v', 'warning', '-ss', time, '-t', '1', '-i', pathToVideo, '-map', 'V', '-f', 'null', '-',
      ];
      // console.log('extracting clip frame 1');
      const ffmpeg_process = spawn(ffmpegPath, args);
      // Note from past Cal to future Cal:
      // ALWAYS READ THE DATA, EVEN IF YOU DO NOTHING WITH IT
      ffmpeg_process.stdout.on('data', data => {
        if (globals.debug) {
          console.log(data);
          if (data.match(corruptRegex)) {
            // skip this file
            console.log(pathToVideo + ' was corrupt, skipping!');
            return resolve(false);
          }
        }
      });
      ffmpeg_process.stderr.on('data', data => {
        if (globals.debug) {
          console.log('grep stderr: ' + data);
          if (data.match(corruptRegex)) {
            console.log(pathToVideo + ' was corrupt, skipping!');
            return resolve(false);
          }
          return resolve(false);
        }
      });
      ffmpeg_process.on('exit', () => {
        check(current + 1);
      });
    };
    check(0);
  });

};
