import * as path from 'path';

const fs = require('fs');

import { FinalObject, ImageElement } from "./src/app/components/common/final-object.interface";

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
 * Extract filename from `path/to/the/file.vha` or `path\to\the\file.vha`
 * In this example would return`file`
 */
export function extractFileName(filePath: string): string {
  return path.parse(filePath).name;
}

/**
 * Write the final object into `vha` file
 * @param finalObject   -- finalObject
 * @param pathToFile    -- the path with name of `vha` file to write to disk
 * @param callBackFunc  -- function to execute when done writing the file
 */
export function writeVhaFileDangerously(finalObject: FinalObject, pathToTheFile: string, callBackFunc): void {
  const json = JSON.stringify(finalObject);
  // write the file
  fs.writeFile(pathToTheFile, json, 'utf8', callBackFunc);
}

/**
 * Clean up the file name
 * (1) underscores
 * (2) double spaces / tripple spaces
 * (3) remove filename
 * (4) strip periods
 * @param original {string}
 * @return {string}
 */
function cleanUpFileName(original: string): string {
  let result = original;

  result = result.split('_').join(' ');                // (1)
  result = result.split('.').slice(0, -1).join('.');   // (3)
  result = result.split('.').join(' ');                // (4)

  result = result.split('   ').join(' ');              // (2)
  result = result.split('  ').join(' ');               // (2)

  return result;
}

const acceptableFiles = [
  '264',
  '265',
  '3g2',
  '3gp',
  'avi',
  'divx',
  'flv',
  'h264',
  'h265',
  'hevc',
  'm4a',
  'm4v',
  'm4v',
  'mkv',
  'mov',
  'mp2',
  'mp4',
  'mpe',
  'mpeg',
  'mpg',
  'ogg',
  'rm',
  'vob',
  'webm',
  'wmv'
];

/*
// If ever I want a dynamic extraction
const count = 10;
// from https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/issues/449#issuecomment-285759269
const timestamps = [];
const startPositionPercent = 5;
const endPositionPercent = 95;
const addPercent = (endPositionPercent - startPositionPercent) / (count - 1);
// create an array that says ['5%', '15%', '25%', '35%', '45%', '55%', '65%', '75%', '85%', '95%']
if (!timestamps.length) {
  let t = 0;
  while (t < count) {
    timestamps.push(`${startPositionPercent + addPercent * t}%`);
    t = t + 1;
  }
}
// some of the above can be replaced with a simple array
*/


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
  let fileCounter: number = 0;

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
            finalArray[fileCounter] = [partialPath, file, cleanUpFileName(file), 0, 0, '', 0, 0];
            fileCounter++;
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

/**
 * Take 10 screenshots of a particular file
 * at particular file size
 * save as particular fileNumber
 * @param pathToVideo  -- full path to the video file
 * @param fileNumber   -- used to number the jpg file, eg 3 => 3-0.jpg, 3-1.jpg, 3-2.jpg, etc
 * @param screensize   -- resolution in pixels (defaul is 100)
 * @param saveLocation -- folder where to save jpg files
 * @param doneCallback
 */
export function takeTenScreenshots(
  pathToVideo: string, 
  fileNumber: number, 
  screenSize: number,
  saveLocation: string,
  doneCallback: any
) {

  let current: number = 0;
  const totalCount = 10;
  const timestamps = ['5%', '15%', '25%', '35%', '45%', '55%', '65%', '75%', '85%', '95%'];

  const extractOneFile = () => {
    ffmpeg(pathToVideo)
      .screenshots({
        count: 1,
        timemarks: [timestamps[current]],
        filename: fileNumber + `-${current + 1}.jpg`,
        size: '?x' + screenSize
      }, saveLocation)
      .on('end', () => {
        current++;
        if (current < totalCount) {
          extractOneFile();
        } else if (current === totalCount) {
          doneCallback();
        }
      })
      .on('error', () => {
        doneCallback();
      });
  }

  extractOneFile();
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
  console.log(indexes);

  return indexes;
}

/**
 * Figure out indexes in finalArray of elements whose screenshot needs to be taken
 * We know that when finalArray[n][3] > lastScreenshot
 */
export function onlyNewIndexes(fullArray: ImageElement[], minIndex: number) {
  const indexes: number[] = [];
  const total: number = fullArray.length;

  fullArray.forEach((element, index) => {
    if (element[3] > minIndex) {
      indexes.push(index);
    }
  });

  console.log(indexes);

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
  lastScreen: number
): ImageElement[] {

  let tempLastScreenCounter: number = lastScreen;

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
      tempLastScreenCounter++;
      newElement[3] = tempLastScreenCounter;  // FILL IN THE INDEX !!! correctly !!! ### ERROR !?!?!!
      theDiff.push(newElement);
    }
  });

  return theDiff;
}



/**
 * Clean up finalImages coming from Angular, removing all those absent from Hard Drive
 * Also deletes all the images related to the video files that are no longer present
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
      superDangerousDelete(folderWhereImagesAre, value[3]);
      return false;
    }
  });


  return cleanedArray;
}
