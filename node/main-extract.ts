/**
 * This file contains all the logic for extracting:
 * first thumbnail,
 * full filmstrip,
 * the preview clip
 * the clip's first thumbnail
 *
 * All functions are PURE
 *
 * Huge thank you to cal2195 for the code contribution
 * He implemented the efficient filmstrip and clip extraction!
 */

// ========================================================================================
//          Imports
// ========================================================================================

// cool method to disable all console.log statements!
// console.log('console.log disabled in main-extract.ts');
// console.log = function() {};

// const { performance } = require('perf_hooks');  // for logging time taken during debug

const fs = require('fs');
import * as path from 'path';
const spawn = require('child_process').spawn;

const ffmpegPath = require('ffmpeg-static').replace('app.asar', 'app.asar.unpacked');

import { GLOBALS } from './main-globals';

import type { ImageElement, ScreenshotSettings } from '../interfaces/final-object.interface';
import { acceptableImageFiles } from './main-filenames';


// ========================================================================================
//          FFMPEG arg generating functions
// ========================================================================================

/**
 * Generate the ffmpeg args to extract a single frame according to settings
 * @param pathToVideo
 * @param screenshotHeight
 * @param duration
 * @param savePath
 */
const extractSingleFrameArgs = (
  currentElement: ImageElement,
  pathToVideo: string,
  screenshotHeight: number,
  savePath: string,
): string[] => {

  const ssWidth: number = screenshotHeight * (16 / 9);

  if (currentElement.type == 'image') {
    const args: string[] = [
      '-i', pathToVideo,
      '-q:v', '2',
      '-vf', scaleAndPadString(ssWidth, screenshotHeight),
      savePath,
    ];
    return args;
  }

  const args: string[] = [
    '-ss', (currentElement.duration / 10).toString(),
    '-i', pathToVideo,
    '-frames', '1',
    '-q:v', '2',
    '-vf', scaleAndPadString(ssWidth, screenshotHeight),
    savePath,
  ];

  return args;
};

/**
 * Take N screenshots of a particular file
 * at particular file size
 * save as particular fileHash
 * (if filmstrip not already present)
 *
 * @param pathToVideo          -- full path to the video file
 * @param duration             -- duration of clip
 * @param screenshotHeight     -- height of screenshot in pixels
 * @param numberOfScreenshots  -- number of screenshots to extract
 * @param savePath             -- full path to file name and extension
 */
const generateScreenshotStripArgs = (
  pathToVideo: string,
  duration: number,
  screenshotHeight: number,
  numberOfScreenshots: number,
  savePath: string,
): string[] => {

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
  args.push(
    '-frames', '1',
    '-filter_complex', allFramesFiltered + outputFrames + 'hstack=inputs=' + totalCount,
    savePath
  );

  return args;
};

/**
 * Generate the mp4 preview clip of the video file
 * (if clip is not already present)
 *
 * @param pathToVideo   -- full path to the video file
 * @param duration      -- duration of the original video file
 * @param clipHeight    -- height of clip
 * @param clipSnippets  -- number of clip snippets to extract
 * @param snippetLength -- length in seconds of each snippet
 * @param savePath      -- full path to file name and extension
 */
const generatePreviewClipArgs = (
  pathToVideo: string,
  duration: number,
  clipHeight: number,
  clipSnippets: number,
  snippetLength: number,
  savePath: string,
): string[] => {

  let current = 1;
  const totalCount = clipSnippets;
  const step: number = duration / (totalCount + 1);
  const args: string[] = [];
  let concat = '';

  // make the magic filter
  while (current <= totalCount) {
    const time = current * step;
    const preview_duration = snippetLength;
    args.push('-ss', time.toString(), '-t', preview_duration.toString(), '-i', pathToVideo);
    concat += '[' + (current - 1) + ':V]' + '[' + (current - 1) + ':a]';
    current++;
  }

  concat += 'concat=n=' + totalCount + ':v=1:a=1[v][a];[v]scale=-2:' + clipHeight + '[v2]';
  args.push('-filter_complex',
            concat,
            '-map',
            '[v2]',
            '-map',
            '[a]',
            savePath);
  // phfff glad that's over

  return args;
};

/**
 * Extract the first frame from the preview clip
 *
 * @param pathToClip -- full path to where the .mp4 clip is located
 * @param fileHash   -- full path to where the .jpg should be saved
 */
const extractFirstFrameArgs = (
  pathToClip: string,
  pathToThumb: string
): string[] => {

  const args: string[] = [
    '-ss', '0',
    '-i', pathToClip,
    '-frames', '1',
    '-f', 'image2',
    pathToThumb,
  ];

  return args;
};

// ========================================================================================
//          Extraction engine
// ========================================================================================

/**
 * Extract thumbnail, filmstrip, and possibly clip
 *
 * Extract following this order. Each stage returns a boolean
 * (^) means RESTART -- go back to (1) with the next item-to-extract on the list
 *
 * SOURCE FILE ============================
 *   (1) check if input file exists
 *         T:                           (2)
 *         F:                           (^) restart
 * THUMB ==================================
 *   (2) check thumb exists
 *         T:                           (4)
 *         F:                           (3)
 *   (3) extract the SINGLE screenshot
 *         T:                           (4)
 *         F:                           (^) restart - assume corrupt
 * FILMSTRIP ==============================
 *   (4) check filmstrip exists
 *         T:                           (6)
 *         F:                           (5)
 *   (5) extract the FILMSTRIP
 *         T: (clipSnippets === 0) ?
 *             T:   nothing to do       (^) restart
 *             F:                       (6)
 *         F:                           (^) restart - assume corrupt
 * CLIP ===================================
 *   (6) check clip exists
 *         T:                           (8)
 *         F:                           (7)
 *   (7) extract the CLIP
 *         T:                           (8)
 *         F:                           (^) restart - assume corrupt
 * CLIP THUMB =============================
 *   (8) check clip thumb exists
 *         T:                           (^) restart
 *         F:                           (9)
 *   (9) extract the CLIP preview
 *         T:                           (^) restart
 *         F:                           (^) restart
 *
 * @param currentElement     -- ImageElement to extract thumbs
 * @param videoFolderPath    -- path to base folder where videos are
 * @param screenshotFolder   -- path to folder where .jpg files will be saved
 * @param screenshotSettings -- ScreenshotSettings object
 * @param done               -- execute this method when done extracting
 */
export function extractAll(
  currentElement: ImageElement,
  videoFolderPath: string,
  screenshotFolder: string,
  screenshotSettings: ScreenshotSettings,
  done
): void {

  const clipHeight:       number = screenshotSettings.clipHeight;        // -- number in px how tall each clip should be
  const clipSnippets:     number = screenshotSettings.clipSnippets;      // -- number of clip snippets to extract; 0 == do not extract clip
  const screenshotHeight: number = screenshotSettings.height;            // -- number in px how tall each screenshot should be
  const snippetLength:    number = screenshotSettings.clipSnippetLength; // -- length of each snippet in the clip

  const pathToVideo: string = path.join(videoFolderPath, currentElement.partialPath, currentElement.fileName);

  const duration:     number = currentElement.duration;
  const fileHash:     string = currentElement.hash;
  const numOfScreens: number = currentElement.screens;
  const sourceHeight: number = currentElement.height;

  const thumbnailSavePath: string = path.normalize(screenshotFolder + '/thumbnails/' + fileHash + '.jpg');
  const filmstripSavePath: string = path.normalize(screenshotFolder + '/filmstrips/' + fileHash + '.jpg');
  const clipSavePath:      string = path.normalize(screenshotFolder + '/clips/' +      fileHash + '.mp4');
  const clipThumbSavePath: string = path.normalize(screenshotFolder + '/clips/' +      fileHash + '.jpg');

  const maxRunTime: ExtractionDurations = setExtractionDurations(
    sourceHeight, numOfScreens, screenshotHeight, clipSnippets, snippetLength, clipHeight
  );

  checkFileExists(pathToVideo)                                                            // (1)
    .then((videoFileExists: boolean) => {
      // console.log('01 - video file live = ' + videoFileExists);

      if (!videoFileExists) {
        throw new Error('VIDEO FILE NOT PRESENT');
      } else {
        return checkFileExists(thumbnailSavePath);                                        // (2)
      }
    })
    .then((thumbExists: boolean) => {
      // console.log('02 - thumbnail already present = ' + thumbExists);

      if (thumbExists) {
        return true;
      } else {
        const ffmpegArgs: string[] =  extractSingleFrameArgs(
          currentElement, pathToVideo, screenshotHeight, thumbnailSavePath
        );

        return spawn_ffmpeg_and_run(ffmpegArgs, maxRunTime.thumb, 'thumb');               // (3)
      }
    })
    .then((thumbSuccess: boolean) => {
      // console.log('03 - single screenshot now present = ' + thumbSuccess);

      if (!thumbSuccess) {
        throw new Error('SINGLE SCREENSHOT EXTRACTION TIMED OUT - LIKELY CORRUPT');
      } else {
        if (currentElement.type == 'image') {
          // Bale out early, images don't need anything else
          done();
          return;
        }
        return checkFileExists(filmstripSavePath);                                        // (4)
      }
    })
    .then((filmstripExists: boolean) => {
      // console.log('04 - filmstrip already present = ' + filmstripExists);

      if (filmstripExists) {
        return true;
      } else {

        const ffmpegArgs: string [] = generateScreenshotStripArgs(
          pathToVideo, duration, screenshotHeight, numOfScreens, filmstripSavePath
        );

        return spawn_ffmpeg_and_run(ffmpegArgs, maxRunTime.filmstrip, 'filmstrip');       // (5)
      }
    })
    .then((filmstripSuccess: boolean) => {
      // console.log('05 - filmstrip now present = ' + filmstripSuccess);

      if (!filmstripSuccess) {
        throw new Error('FILMSTRIP GENERATION TIMED OUT - LIKELY CORRUPT');
      } else if (clipSnippets === 0) {
        throw new Error('USER DOES NOT WANT CLIPS');
      } else {
        return checkFileExists(clipSavePath);                                             // (6)
      }
    })
    .then((clipExists: boolean) => {
      // console.log('04 - preview clip already present = ' + clipExists);

      if (clipExists) {
        return true;
      } else {

        const ffmpegArgs: string[] = generatePreviewClipArgs(
          pathToVideo, duration, clipHeight, clipSnippets, snippetLength, clipSavePath
        );

        return spawn_ffmpeg_and_run(ffmpegArgs, maxRunTime.clip, 'clip');                 // (7)
      }

    })
    .then((clipGenerationSuccess: boolean) => {
      // console.log('07 - preview clip now present = ' + clipGenerationSuccess);

      if (clipGenerationSuccess) {
        return checkFileExists(clipThumbSavePath);                                        // (8)
      } else {
        throw new Error('ERROR GENERATING CLIP');
      }
    })
    .then((clipThumbExists: boolean) => {
      // console.log('05 - preview clip thumb already present = ' + clipThumbExists);

      if (clipThumbExists) {
        return true;
      } else {
        const ffmpegArgs: string[] = extractFirstFrameArgs(clipSavePath, clipThumbSavePath);

        return spawn_ffmpeg_and_run(ffmpegArgs, maxRunTime.clipThumb, 'clip thumb');      // (9)
      }
    })
    .then((success: boolean) => {
      // console.log('09 - preview clip thumb now exists = ' + success);

      if (success) {
        // console.log('======= ALL STEPS SUCCESSFUL ==========');
      }
      done();
    })
    .catch((err) => {
      // console.log('===> ERROR - RESTARTING: ' + err);
      done();
    });
}

// ========================================================================================
//         Helper methods
// ========================================================================================

interface ExtractionDurations {
  thumb: number;
  filmstrip: number;
  clip: number;
  clipThumb: number;
}

/**
 * Set the ExtractionDurations - the maximum running time per extraction type
 * if ffmpeg takes longer, it is taken out the back and shot - killed with no mercy
 *
 * These computations are not exact, they are meant meant to give a rough timeout window
 * to prevent corrupt files from slowing down the extraction too much
 *
 * @param sourceHeight - height of the original video
 * @param numOfScreens
 * @param screenshotHeight
 * @param clipSnippets
 * @param snippetLength
 * @param clipHeight
 */
function setExtractionDurations(
  sourceHeight: number,
  numOfScreens: number,
  screenshotHeight: number,
  clipSnippets: number,
  snippetLength: number,
  clipHeight: number
): ExtractionDurations {

  // screenshot heights range from 144px to 504px
  // we'll call 144 the baseline and increase duration based on this
  // number of pixels grows ~ as square of height, so we square below
  // this means at highest resolution we multyply by 12.5 the time we wait
  const thumbHeightRatio = screenshotHeight / 144; // max 3.5 or 12.25 when squared
  const thumbHeightFactor = 1 + (thumbHeightRatio * thumbHeightRatio / 4); // square of ratio
  // not using Math.pow(n,2) because this is apparently faster https://stackoverflow.com/a/26594370/5017391

  const clipHeightRatio = clipHeight / 144; // max 3.5 or 12.25 when squared
  const clipHeightFactor = 1 + (clipHeightRatio * clipHeightRatio / 4); // square of ratio

  const sourceRatio = (sourceHeight === 0) ? 1 : (sourceHeight / 720); // 3 when source is 4k
  const sourceFactor = 1 + (sourceRatio * sourceRatio / 3); // square of ratio

  return {                                                                           // for me:
    thumb:     500 * sourceFactor * thumbHeightFactor,                               // never above 800ms
    filmstrip: 350 * sourceFactor * thumbHeightFactor * numOfScreens,                // rarely above 15s, but 4K 30screens took 50s
    clip:      350 * sourceFactor * clipHeightFactor * clipSnippets * snippetLength, // rarely above 15s
    clipThumb: 400 * clipHeightRatio,                                                // never above 600ms
  };
}

/**
 * Return promise for whether file exists
 * @param pathToFile string
 */
function checkFileExists(pathToFile: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    fs.access(pathToFile, fs.constants.F_OK, (err: any) => {
      return(resolve(!err));
    });
  });
}

/**
 * Replace original file with new file
 * use ffmpeg to convert and letterbox to fit width and height
 *
 * @param oldFile full path to thumbnail to replace
 * @param newFile full path to sounce image to use as replacement
 * @param height
 */
export function replaceThumbnailWithNewImage(
  oldFile: string,
  newFile: string,
  height: number
): Promise<boolean> {

  console.log('Resizing new image and replacing old thumbnail');

  const width: number = Math.floor(height * (16 / 9));

  const args = [
    '-y', '-i', newFile,
    '-vf', scaleAndPadString(width, height),
    oldFile,
  ];

  return spawn_ffmpeg_and_run(args, 1000, 'replacing thumbnail');
  // resizing an image file with ffmpeg should take less than 1 second
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

    // Uncomment things in this method (and the `performance` import) to check how long extraction takes
    // const t0: number = performance.now();

    const ffmpeg_process = spawn(ffmpegPath, args);

    const killProcessTimeout = setTimeout(() => {
      if (!ffmpeg_process.killed) {
        ffmpeg_process.kill();
        // console.log(description + ' KILLED EARLY');
        return resolve(false);
      }
    }, maxRunningTime);

    // Note from past Cal to future Cal:
    // ALWAYS READ THE DATA, EVEN IF YOU DO NOTHING WITH IT
    ffmpeg_process.stdout.on('data', data => {
      if (GLOBALS.debug) {
        console.log(data);
      }
    });
    ffmpeg_process.stderr.on('data', data => {
      if (GLOBALS.debug) {
        console.log('grep stderr: ' + data);
      }
    });
    ffmpeg_process.on('exit', () => {
      clearTimeout(killProcessTimeout);
      // const t1: number = performance.now();
      // console.log(description + ' ' + Math.round(t1 - t0) + ' < ' + maxRunningTime);
      return resolve(true);
    });

  });

}
