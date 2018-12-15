import * as path from 'path';

const fs = require('fs');
const hasher = require('crypto').createHash;

import { FinalObject, ImageElement } from './src/app/components/common/final-object.interface';
import { acceptableFiles } from './main-filenames';

import { globals } from './main-globals';

/**
 * Hash a given file using it's file name and size
 * md5(file.name + file.size)
 * @param fileName  -- file name to hash
 * @param fileSize  -- file size to hash
 */
export function hashFile(fileName: string, fileSize: number): string {
  // make the magic happen!
  const hash = hasher('md5').update(fileName + fileSize.toString()).digest('hex');
  return hash;
}

/**
 * Label the video according to these rules
 * 5th item is size (720, 1080, etc)
 * @param width
 * @param height
 */
export function labelVideo(width: number, height: number): string {
  let size = '';
  if (width === 3840 && height === 2160) {
    size = '4k';
  } else if (width === 1920 && height === 1080) {
    size = '1080';
  } else if (width === 1280 && height === 720) {
    size = '720';
  } else if (width > 3840) {
    size = '4K+';
  } else if (width > 1920) {
    size = '1080+';
  } else if (width > 720) {
    size = '720+';
  }
  return size;
}

/**
 * Alphabetizes an array of `ImageElement`
 * prioritizing the folder, and then filename
 */
export function alphabetizeFinalArray(imagesArray: ImageElement[]): ImageElement[] {
  return imagesArray.sort((x: ImageElement, y: ImageElement): number => {
    const folder1: string = x[0].toLowerCase();
    const folder2: string = y[0].toLowerCase();
    const file1: string = x[1].toLowerCase();
    const file2: string = y[1].toLowerCase();

    if (folder1 > folder2) {
      return 1;
    } else if (folder1 === folder2 && file1 > file2) {
      return 1;
    } else if (folder1 === folder2 && file1 === file2) {
      return 0;
    } else if (folder1 === folder2 && file1 < file2) {
      return -1;
    } else if (folder1 < folder2) {
      return -1;
    }
  });
}

/**
 * Count the number of unique folders in the final array
 */
export function countFoldersInFinalArray(imagesArray: ImageElement[]): number {
  const finalArrayFolderMap: Map<string, number> = new Map;
  imagesArray.forEach((element: ImageElement) => {
    if (!finalArrayFolderMap.has(element[0])) {
      finalArrayFolderMap.set(element[0], 1);
    }
  });
  return finalArrayFolderMap.size;
}

/**
 * Write the final object into `vha` file
 * @param finalObject   -- finalObject
 * @param pathToFile    -- the path with name of `vha` file to write to disk
 * @param done          -- function to execute when done writing the file
 */
export function writeVhaFileDangerously(finalObject: FinalObject, pathToTheFile: string, done): void {
  // check for relative paths
  if (finalObject.inputDir === path.parse(pathToTheFile).dir) {
    finalObject.inputDir = "";
  }

  const json = JSON.stringify(finalObject);
  // write the file
  fs.writeFile(pathToTheFile, json, 'utf8', done);
  // CATCH ERRORS !?!!?!!
}

/**
 * Clean up the displayed file name
 * (1) remove extension
 * (2) replace underscores with spaces
 * (3) replace periods with spaces
 * (4) tripple & double spaces become single spaces
 * @param original {string}
 * @return {string}
 */
function cleanUpFileName(original: string): string {
  let cleaned = original;
  cleaned = cleaned.split('.').slice(0, -1).join('.');   // (1)
  cleaned = cleaned.split('_').join(' ');                // (2)
  cleaned = cleaned.split('.').join(' ');                // (3)
  cleaned = cleaned.split('   ').join(' ');              // (4)
  cleaned = cleaned.split('  ').join(' ');               // (4)
  return cleaned;
}

/**
 * Check if path is to a file system reserved object or folder
 * @param thingy path to particular file / directory
 */
function fileSystemReserved(thingy: string): boolean {
  return (thingy.startsWith('$') || thingy === 'System Volume Information');
}

/**
 * walk the path and return array of `ImageElements`
 * @param sourceFolderPath
 */
export function getVideoPathsAndNames(sourceFolderPath: string): ImageElement[] {

  const finalArray: ImageElement[] = [];
  let elementIndex: number = 0;

  // Recursively walk through a directory compiling ImageElements
  const walkSync = (dir, filelist) => {
    const files = fs.readdirSync(dir);

    files.forEach(function (file) {
      if (!fileSystemReserved(file)) {
        // if the item is a _DIRECTORY_
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
          filelist = walkSync(path.join(dir, file), filelist);
        } else {
          const extension = file.split('.').pop();
          if (acceptableFiles.includes(extension.toLowerCase())) {
            // before adding, remove the redundant prefix: sourceFolderPath
            const partialPath = dir.replace(sourceFolderPath, '');
            // fil finalArray with 3 correct and 5 dummy pieces of data
            finalArray[elementIndex] = [partialPath, file, cleanUpFileName(file), '', 0, '', 0, 0];
            elementIndex++;
          }
        }
      }
    });

    return filelist;
  };

  walkSync(sourceFolderPath, []);

  return finalArray;
}


/**
 * Figure out and return the number of video files in a directory
 * @param folderPath path to folder to scan
 */
export function numberOfVidsIn(folderPath: string): number {

  let totalNumberOfFiles = 0;

  // increases `totalNumberOfFiles` for every file found
  const walkAndCountSync = (dir, filelist) => {
    const files = fs.readdirSync(dir);

    files.forEach(function (file: string) {
      if (!fileSystemReserved(file)) {
        // if the item is a _DIRECTORY_
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
          filelist = walkAndCountSync(path.join(dir, file), filelist);
        } else {
          const extension = file.split('.').pop();
          if (acceptableFiles.includes(extension.toLowerCase())) {
            totalNumberOfFiles++;
          }
        }
      }
    });

    return filelist;
  };

  walkAndCountSync(folderPath, []);

  return totalNumberOfFiles;
}

// -------------- SCAN IMAGES AND SAVE THEM !!! -----------------

const ffprobePath = require('@ffprobe-installer/ffprobe').path.replace('app.asar', 'app.asar.unpacked');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path.replace('app.asar', 'app.asar.unpacked');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfprobePath(ffprobePath);
ffmpeg.setFfmpegPath(ffmpegPath);

const spawn = require('child_process').spawn;

/**
 * Take 10 screenshots of a particular file
 * at particular file size
 * save as particular fileNumber
 * @param pathToVideo  -- full path to the video file
 * @param fileHash     -- hash of the video file
 * @param screensize   -- resolution in pixels (defaul is 100)
 * @param saveLocation -- folder where to save jpg files
 * @param done         -- callback when done
 */
export function takeTenScreenshots(
  pathToVideo: string,
  fileHash: string,
  duration: number,
  screenSize: number,
  saveLocation: string,
  done: any
) {

  if (fs.existsSync(saveLocation + '/' + fileHash + '.jpg')) {
    //console.log("thumbnails for " + fileHash + " already exist");
    done();
  }

  let current: number = 1;
  const totalCount = 11;
  const step: number = duration / totalCount;
  var args = [];
  let concat = "";

  // make the magic filter
  while (current < totalCount) {
    let time = current * step;
    args.push('-ss', time, '-i', pathToVideo);
    concat += "[" + (current - 1) + ":v]";
    current++;
  }
  args.push('-frames', 1, '-filter_complex', concat + "vstack=inputs=" + (totalCount - 1), saveLocation + '/' + fileHash + '.jpg');

  const ffmpeg = spawn(ffmpegPath, args);
  ffmpeg.stdout.on('data', function (data) {
    console.log(data);
  });
  ffmpeg.stderr.on('data', function (data) {
    console.log('grep stderr: ' + data);
  });
  ffmpeg.on('exit', () => {
    done();
  });
}

// ------------------------ SUPER DANGEROUSLY DELETE

/**
 * Super dangerously delete 10 images from images folder given the base number
 * Deletes 10 images with given base
 * uses `folderToDeleteFrom` variable !!!
 * @param numberOfImage
 */
export function superDangerousDelete(imageLocation: string, numberOfImage: number): void {
  // console.log('index given: ' + numberOfImage);
  const filePath = path.join(imageLocation, numberOfImage.toString());

  for (let i = 1; i < 11; i++) {
    const currentFile: string = filePath + '-' + i.toString() + '.jpg';
    if (fs.existsSync(currentFile)) {
      fs.unlinkSync(currentFile, (err) => {
        // console.log(err);
        // Don't even sweat it dawg!
      });
      // console.log('deleted ' + currentFile);
    }
  }
}


// GENERATE INDEXES FOR ARRAY

export function hasAllThumbs(fileHash: string, screenshotFolder: string) : boolean {
  // Check in reverse order for efficiency
  return fs.existsSync(screenshotFolder + '/' + fileHash + '-first.jpg')
         && fs.existsSync(screenshotFolder + '/' + fileHash + '.mp4')
         && fs.existsSync(screenshotFolder + '/' + fileHash + '.jpg');
}

/**
 * Generate indexes for any files missing thumbnails
 */
export function missingThumbsIndex(fullArray: ImageElement[], screenshotFolder: string): number[] {
  const indexes: number[] = [];
  const total: number = fullArray.length;
  for (let i = 0; i < total; i++) {
    if (!hasAllThumbs(fullArray[i][3], screenshotFolder)) {
      indexes.push(i);
    }
  }

  return indexes;
}

/**
 * Generate indexes for each element in finalArray, e.g.
 * [0, 1, 2, 3, ..., n] where n = finalArray.length
 */
export function everyIndex(fullArray: ImageElement[]): number[] {
  const indexes: number[] = [];
  const total: number = fullArray.length;
  for (let i = 0; i < total; i++) {
    indexes.push(i);
  }

  return indexes;
}


/**
 * Find all the new files added to the source directory and return array of them
 * @param angularFinalArray  -- finalArray as it stands currently in the app
 * @param hdFinalArray  -- finalArray ais it stands on the Hard Drive (after scan)
 * @param inputFolder  -- location where all the videos are
 */
export function findAllNewFiles(
  angularFinalArray: ImageElement[],
  hdFinalArray: ImageElement[],
  inputFolder: string,
): ImageElement[] {

  const theDiff: ImageElement[] = [];

  hdFinalArray.forEach((newElement) => {
    let matchFound = false;
    angularFinalArray.forEach((oldElement) => {
      const pathStripped = newElement[0].replace(inputFolder, '');
      if (pathStripped === oldElement[0] && newElement[1] === oldElement[1]) {
        matchFound = true;
      }
    });

    if (!matchFound) { // means new element !!!
      theDiff.push(newElement);
    }
  });

  return theDiff;
}


/**
 * Clean up ImageElement[] coming from Angular, removing all elements for videos no longer on the Hard Drive
 * Also deletes all the .jpg images related to the video files that are no longer present
 * @param angularFinalArray  -- ImageElement[] representing what is currently in Angular
 * @param hdFinalArray -- ImageElement[] representing what is currently on the Hard Drive
 * @param inputFolder -- folder where the videos are located
 * @param folderWhereImagesAre -- folder where the images are located (for deletion)
 */
export function finalArrayWithoutDeleted(
  angularFinalArray: ImageElement[],
  hdFinalArray: ImageElement[],
  inputFolder: string,
  folderWhereImagesAre: string
): ImageElement[] {
  const cleanedArray: ImageElement[] = angularFinalArray.filter((value) => {
    let matchFound = false;

    hdFinalArray.forEach((newElement) => {
      const pathStripped = newElement[0].replace(inputFolder, '');
      if (pathStripped === value[0] && newElement[1] === value[1]) {
        matchFound = true;
      }
    });

    if (matchFound) {
      return true;
    } else {
      //superDangerousDelete(folderWhereImagesAre, value[3]);
      return false;
    }
  });

  return cleanedArray;
}

// --------------------------------------------------------------------------------------------
// -- EXTRACT METADATA --
// --------------------------------------------------------------------------------------------

/**
 * Extract the meta data & store it in the final array
 * @param theFinalArray   -- ImageElement[] with dummy meta
 * @param videoFolderPath -- the full path to the base folder for video files
 * @param metaStartIndex  -- the starting point in finalArray from where to extract metadata
 *                           (should be 0 when first scan, should be index of first element when rescan)
 * @param done            -- callback when done with all metadata extraction
 */
export function extractAllMetadata(
  theFinalArray: ImageElement[],
  videoFolderPath: string,
  metaStartIndex: number,
  done: any
): void {

  const itemTotal = theFinalArray.length;
  let iterator = metaStartIndex;

  let elementsWithMetadata: ImageElement[] = [];

  if (metaStartIndex !== 0) { // if not a fresh scan
    elementsWithMetadata = theFinalArray.slice(0, metaStartIndex); // keep those elements that have metadata
  }

  const extractMetaDataCallback = (element: ImageElement | null): void => {

    if (element !== null) {
      iterator++;
      elementsWithMetadata.push(element);
    }

    if (iterator < itemTotal) {

      sendCurrentProgress(iterator, itemTotal, 1);

      const filePathNEW = (path.join(videoFolderPath,
                                    theFinalArray[iterator][0],
                                    theFinalArray[iterator][1]));

      extractMetadataForThisONEFile(filePathNEW, theFinalArray[iterator], extractMetaDataCallback);

    } else {

      done(elementsWithMetadata);

    }
  }

  extractMetaDataCallback(null);
}

/**
 * Updates the finalArray with the metadata about one particualar requested file
 * Updates newLastScreenCounterNEW global variable !!!
 * @param filePath      path to the file
 * @param imageElement  index in array to update
 */
function extractMetadataForThisONEFile(
  filePath: string,
  imageElement: ImageElement,
  extractMetaCallback: any
): void {
  ffmpeg.ffprobe(filePath, (err, metadata) => {
    if (err) {
      extractMetaCallback(imageElement);
    } else {
      const duration = Math.round(metadata.format.duration) || 0;
      const origWidth = metadata.streams[0].width;
      const origHeight = metadata.streams[0].height;
      const sizeLabel = labelVideo(origWidth, origHeight);
      const width = Math.round(100 * origWidth / origHeight) || 169;
      const fileSize = metadata.format.size;
      imageElement[3] = hashFile(imageElement[1], fileSize);
      imageElement[4] = duration;  // 4th item is duration
      imageElement[5] = sizeLabel; // 5th item is the label, e.g. 'HD'
      imageElement[6] = width;     // 6th item is width of screenshot in px (e.g. 150);
      imageElement[7] = fileSize;  // 7th item is file size

      extractMetaCallback(imageElement);
    }
  });
}


/**
 * Figures out what new files there are,
 * adds them to the finalArray,
 * figures out what files no longer exist,
 * removes them from finalArray,
 * deletes .jpg files from HD,
 * and calls `extractAllMetadata`
 * (which will then send file home and start extracting images)
 * @param angularFinalArray  -- array of ImageElements from Angular - most current view
 * @param hdFinalArray       -- array of ImageElements from current hard drive scan
 * @param inputFolder        -- the input folder (where videos are)
 * @param folderToDeleteFrom -- path to folder where `.jpg` files are
 * @param extractMetadataCallback -- function for extractAllMetadata to call when done
 */
export function updateFinalArrayWithHD(
  angularFinalArray: ImageElement[],
  hdFinalArray: ImageElement[],
  inputFolder: string,
  folderToDeleteFrom: string,
  extractMetadataCallback
): void {

  // Generate ImageElement[] of all the new elements to be added
  const onlyNewElements: ImageElement[] =
    findAllNewFiles(angularFinalArray, hdFinalArray, inputFolder);

  // remove from FinalArray all files that are no longer in the video folder
  const allDeletedRemoved: ImageElement[] =
    finalArrayWithoutDeleted(angularFinalArray, hdFinalArray, inputFolder, folderToDeleteFrom);

  // If there are new ifles OR if any files have been deleted !!!
  if (onlyNewElements.length > 0 || allDeletedRemoved.length < angularFinalArray.length) {

    const metaRescanStartIndex = allDeletedRemoved.length;
    const finalArrayUpdated = allDeletedRemoved.concat(onlyNewElements);

    extractAllMetadata(
      finalArrayUpdated,
      inputFolder,
      metaRescanStartIndex,
      extractMetadataCallback // actually = sendFinalResultHome
    );

  } else {
    sendCurrentProgress(1, 1, 0); // indicates 100%
  }

}


/**
 * Sends progress to Angular App
 * @param current number
 * @param total number
 * @param stage number -- 0 = done, 1 = meta, 2 = jpg
 */
export function sendCurrentProgress(current: number, total: number, stage: number): void {
  globals.angularApp.sender.send('processingProgress', current, total, stage);
}
