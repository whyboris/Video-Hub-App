// ALL CAN BE DELETED IN THIS FILE !!!
// Imports are just to make VS Code complain less with red undersines
import { ImageElement } from "../interfaces/final-object.interface";
const fs = require('fs');

// =========================================================================================================================================
// RESCAN - electron messages                                                                                             ARCHIVED FOR NOW -
// -----------------------------------------------------------------------------------------------------------------------------------------
/**
 * ARCHIVED -- will be eliminated when directory watching starts working
 *
 * @param theFinalArray -- `finalArray` with all the metadata filled in
 */
function sendFinalResultHome(theFinalArray: ImageElement[]): void {

  console.log('THIS METHOD DISABLED !!!');
  return;

  const myFinalArray: ImageElement[] = alphabetizeFinalArray(theFinalArray);

  const finalObject: FinalObject = {
    addTags: [], // ERROR ????
    hubName: GLOBALS.hubName,
    images: myFinalArray,
    inputDirs: GLOBALS.selectedSourceFolders,
    numOfFolders: countFoldersInFinalArray(myFinalArray),
    removeTags: [], // ERROR ????
    screenshotSettings: GLOBALS.screenshotSettings,
    version: GLOBALS.vhaFileVersion,
  };

  const pathToTheFile = path.join(GLOBALS.selectedOutputFolder, GLOBALS.hubName + '.vha2');

  writeVhaFileToDisk(finalObject, pathToTheFile, () => {

    GLOBALS.currentlyOpenVhaFile = pathToTheFile;

    sendFinalObjectToAngular(finalObject, GLOBALS);

    startWatchingDirs(finalObject.inputDirs, true);

  });
}

/**
 * Initiate scanning for new files and importing them
 * Now receives the finalArray from `home.component`
 * because the user may have renamed files from within the app!
 */
ipc.on('only-import-new-files', (event, currentAngularFinalArray: ImageElement[]) => {
  const currentVideoFolder = GLOBALS.selectedSourceFolders;
  GLOBALS.cancelCurrentImport = false;
  importOnlyNewFiles(currentAngularFinalArray, currentVideoFolder[0].path);
});

/**
 * Initiate rescan of the input directory
 * This will import new videos
 * and delete screenshots for videos no longer present in the input folder
 * Now receives the finalArray from `home.component`
 * because the user may have renamed files from within the app!
 */
ipc.on('rescan-current-directory', (event, currentAngularFinalArray: ImageElement[]) => {
  const currentVideoFolder = GLOBALS.selectedSourceFolders;
  GLOBALS.cancelCurrentImport = false;
  reScanCurrentDirectory(currentAngularFinalArray, currentVideoFolder[0].path);
});

/**
 * Initiate verifying all files have thumbnails
 * Excellent for continuing the screenshot import if it was ever cancelled
 */
ipc.on('verify-thumbnails', (event, finalArray) => {
  GLOBALS.cancelCurrentImport = false;
  verifyThumbnails(finalArray);
});

/**
 * Scan for missing thumbnails and generate them
 */
function verifyThumbnails(finalArray: ImageElement[]) {
  // resume extracting any missing thumbnails
  const screenshotOutputFolder: string = path.join(GLOBALS.selectedOutputFolder, 'vha-' + GLOBALS.hubName);

  const indexesToScan: number[] = missingThumbsIndex(
    finalArray,
    screenshotOutputFolder,
    GLOBALS.screenshotSettings.clipSnippets > 0
  );

  console.log(finalArray);
  console.log(indexesToScan);
  console.log('DISABLED WIP');
}

/**
 * Begins rescan procedure compared to what the app has currently
 *
 * @param angularFinalArray  - ImageElment[] from Angular (might have renamed files)
 * @param currentVideoFolder - source folder where videos are located (GLOBALS.selectedSourceFolders)
 */
function reScanCurrentDirectory(angularFinalArray: ImageElement[], currentVideoFolder: string) {

  // rescan the source directory
  if (fs.existsSync(currentVideoFolder)) {
    let videosOnHD: ImageElement[] = getVideoPathsAndNames(currentVideoFolder);

    if (demo) {
      videosOnHD = videosOnHD.slice(0, 50);
    }

    const folderToDeleteFrom = path.join(GLOBALS.selectedOutputFolder, 'vha-' + GLOBALS.hubName);

    rescanAddAndDelete(
      angularFinalArray,
      videosOnHD,
      currentVideoFolder,
      GLOBALS.screenshotSettings,
      folderToDeleteFrom,
      sendFinalResultHome           // callback for when `extractAllMetadata` is called
    );

  } else {
    tellUserDirDoesNotExist(currentVideoFolder);
  }
}


/**
 * walk the path and return array of `ImageElements`
 * @param sourceFolderPath
 */
export function getVideoPathsAndNames(sourceFolderPath: string): ImageElement[] {

  const finalArray: ImageElement[] = [];
  let elementIndex = 0;
  // ignore folders beginning with { '.', '__MACOS', 'vha-' }
  const folderIgnoreRegex = /^(\.|__MACOS|vha-).*/g;
  // ignore files beginning with { '.', '_' }
  const fileIgnoreRegex = /^(\.|_).*/g;

  // Recursively walk through a directory compiling ImageElements
  const walkSync = (dir, filelist) => {
    const files = fs.readdirSync(dir, {encoding: 'utf8', withFileTypes: true});

    files.forEach(function (file) {
      if (!fileSystemReserved(file.name)) {
        try {
          // if the item is a _SYMLINK_ or a _DIRECTORY_
          if (
            (file.isSymbolicLink() || file.isDirectory())
            && !file.name.match(folderIgnoreRegex)
          ) {
            filelist = walkSync(path.join(dir, file.name), filelist);
          } else {
            const extension = file.name.split('.').pop();
            if (acceptableFiles.includes(extension.toLowerCase()) && !file.name.match(fileIgnoreRegex)) {
              // before adding, remove the redundant prefix: sourceFolderPath, and convert back slashes into forward slashes
              // turns out app works best when the partialPath starts with `/` even in cases when video in root folder
              const partialPath = ('/' + dir.replace(sourceFolderPath, '').replace(/\\/g, '/')).replace('//', '/');
              // fil finalArray with 3 correct and 5 dummy pieces of data
              finalArray[elementIndex] = NewImageElement();
              finalArray[elementIndex].cleanName = cleanUpFileName(file.name);
              finalArray[elementIndex].fileName = file.name;
              finalArray[elementIndex].partialPath = partialPath;

              elementIndex++;
            }
          }
        } catch (err) {}
      }
    });

    return filelist;
  };

  walkSync(sourceFolderPath, []);

  return finalArray;
}

/**
 * Begin scanning for new files and importing them
 *
 * @param angularFinalArray  - ImageElment[] from Angular (might have renamed files)
 * @param currentVideoFolder - source folder where videos are located (GLOBALS.selectedSourceFolders)
 */
function importOnlyNewFiles(angularFinalArray: ImageElement[], currentVideoFolder: string) {

  // rescan the source directory
  if (fs.existsSync(currentVideoFolder)) {
    let videosOnHD: ImageElement[] = getVideoPathsAndNames(currentVideoFolder);

    if (demo) {
      videosOnHD = videosOnHD.slice(0, 50);
    }

    findAndImportNewFiles(
      angularFinalArray,
      videosOnHD,
      currentVideoFolder,
      GLOBALS.screenshotSettings,
      sendFinalResultHome           // callback for when `extractAllMetadata` is called
    );

  } else {
    tellUserDirDoesNotExist(currentVideoFolder);
  }
}

/**
 * Cancel current import progress & tell user directory does not exist!
 * @param currentVideoFolder
 */
function tellUserDirDoesNotExist(currentVideoFolder: string) {
  sendCurrentProgress(1, 1, 'done');
  dialog.showMessageBox(win, {
    message: systemMessages.directory + ' ' + currentVideoFolder + ' ' + systemMessages.doesNotExist,
    buttons: ['OK']
  });
}

/**
 * Figures out what new files there are,
 * adds them to the finalArray,
 * and calls `extractAllMetadata`
 * (which will then send file home and start extracting images)
 * @param angularFinalArray       -- array of ImageElements from Angular - most current view
 * @param hdFinalArray            -- array of ImageElements from current hard drive scan
 * @param inputFolder             -- the input folder (where videos are)
 * @param screenshotSettings      -- ScreenshotSettings
 * @param extractMetadataCallback -- function for extractAllMetadata to call when done
 */
export function findAndImportNewFiles(
  angularFinalArray: ImageElement[],
  hdFinalArray: ImageElement[],
  inputFolder: string,
  screenshotSettings: ScreenshotSettings,
  extractMetadataCallback
): void {

  // Generate ImageElement[] of all the new elements to be added
  const onlyNewElements: ImageElement[] =
    findAllNewFiles(angularFinalArray, hdFinalArray, inputFolder);

  // Copy any metadata incase files were moved
  copyUserMetadata(angularFinalArray, onlyNewElements);

  // If there are new files
  if (onlyNewElements.length > 0) {

    const metaRescanStartIndex = angularFinalArray.length;
    const finalArrayUpdated = angularFinalArray.concat(onlyNewElements);

    extractAllMetadata(
      finalArrayUpdated,
      inputFolder,
      screenshotSettings,
      metaRescanStartIndex,
      extractMetadataCallback // actually = sendFinalResultHome
    );

  } else {
    sendCurrentProgress(1, 1, 'done'); // indicates 100%
  }

}



// ===========================================================================================
// RESCAN - ARCHIVED
// -------------------------------------------------------------------------------------------

/**
 * Regenerates the library,
 * figures out what files no longer exist,
 * deletes .jpg files from HD,
 * and calls `extractAllMetadata`
 * (which will then send file home and start extracting images)
 * @param angularFinalArray       -- array of ImageElements from Angular - most current view
 * @param hdFinalArray            -- array of ImageElements from current hard drive scan
 * @param inputFolder             -- the input folder (where videos are)
 * @param screenshotSettings      -- ScreenshotSettings
 * @param folderToDeleteFrom      -- path to folder where `.jpg` files are
 * @param extractMetadataCallback -- function for extractAllMetadata to call when done
 */
export function regenerateLibrary(
  angularFinalArray: ImageElement[],
  hdFinalArray: ImageElement[],
  inputFolder: string,
  screenshotSettings: ScreenshotSettings,
  folderToDeleteFrom: string,
  extractMetadataCallback
): void {

  updateArrayWithHashes(hdFinalArray, inputFolder);

  // Copy any user metadata
  copyUserMetadata(angularFinalArray, hdFinalArray);

  // Remove thumbnails no longer present
  finalArrayWithoutDeleted(angularFinalArray, hdFinalArray, inputFolder, folderToDeleteFrom);

  extractAllMetadata(
    hdFinalArray,
    inputFolder,
    screenshotSettings,
    0,
    extractMetadataCallback // actually = sendFinalResultHome
  );
}



/**
 * Figures out what new files there are,
 * adds them to the finalArray,
 * figures out what files no longer exist,
 * removes them from finalArray,
 * deletes .jpg files from HD,    <---------- WARNING !!!
 * and calls `extractAllMetadata`
 * (which will then send file home and start extracting images)
 * @param angularFinalArray       -- array of ImageElements from Angular - most current view
 * @param hdFinalArray            -- array of ImageElements from current hard drive scan
 * @param inputFolder             -- the input folder (where videos are)
 * @param screenshotSettings      -- ScreenshotSettings
 * @param folderToDeleteFrom      -- path to folder where `.jpg` files are
 * @param extractMetadataCallback -- function for extractAllMetadata to call when done
 */
export function rescanAddAndDelete(
  angularFinalArray: ImageElement[],
  hdFinalArray: ImageElement[],
  inputFolder: string,
  screenshotSettings: ScreenshotSettings,
  folderToDeleteFrom: string,
  extractMetadataCallback
): void {

  // Generate ImageElement[] of all the new elements to be added
  const onlyNewElements: ImageElement[] =
    findAllNewFiles(angularFinalArray, hdFinalArray, inputFolder);

  // Copy any metadata incase files were moved
  copyUserMetadata(angularFinalArray, onlyNewElements);

  // remove from FinalArray all files that are no longer in the video folder
  const allDeletedRemoved: ImageElement[] =
    finalArrayWithoutDeleted(angularFinalArray, hdFinalArray, inputFolder, folderToDeleteFrom);

  // If there are new files OR if any files have been deleted !!!
  if (onlyNewElements.length > 0 || allDeletedRemoved.length < angularFinalArray.length) {

    const metaRescanStartIndex = allDeletedRemoved.length;
    const finalArrayUpdated = allDeletedRemoved.concat(onlyNewElements);

    extractAllMetadata(
      finalArrayUpdated,
      inputFolder,
      screenshotSettings,
      metaRescanStartIndex,
      extractMetadataCallback // actually = sendFinalResultHome
    );

  } else {
    sendCurrentProgress(1, 1, 'done'); // indicates 100%
  }

}

// --------------------------------------------------------------------------------------------
// -- EXTRACT METADATA --
// --------------------------------------------------------------------------------------------

/**
 * Extract the meta data & store it in the final array
 * @param theFinalArray   -- ImageElement[] with dummy meta
 * @param videoFolderPath -- the full path to the base folder for video files
 * @param screenshotSettings -- ScreenshotSettings
 * @param metaStartIndex  -- the starting point in finalArray from where to extract metadata
 *                           (should be 0 when first scan, should be index of first element when rescan)
 * @param done            -- callback when done with all metadata extraction
 */
export function extractAllMetadata(
  theFinalArray: ImageElement[],
  videoFolderPath: string,
  screenshotSettings: ScreenshotSettings,
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

      sendCurrentProgress(iterator, itemTotal, 'importingMeta');

      const filePathNEW = (path.join(videoFolderPath,
                                    theFinalArray[iterator].partialPath,
                                    theFinalArray[iterator].fileName));

      extractMetadataForThisONEFile(
        filePathNEW,
        screenshotSettings,
        theFinalArray[iterator],
        extractMetaDataCallback
      );

    } else {

      done(elementsWithMetadata);

    }
  };

  extractMetaDataCallback(null);
}



/**
 * Extracts information about a single file using `ffprobe`
 * Stores information into the ImageElement and returns it via callback
 * @param filePath              path to the file
 * @param screenshotSettings    ScreenshotSettings
 * @param imageElement          index in array to update
 * @param callback
 */
function extractMetadataForThisONEFile(
  filePath: string,
  screenshotSettings: ScreenshotSettings,
  imageElement: ImageElement,
  extractMetaCallback: any
): void {
  const ffprobeCommand = '"' + ffprobePath + '" -of json -show_streams -show_format -select_streams V "' + filePath + '"';
  exec(ffprobeCommand, (err, data, stderr) => {
    if (err) {
      extractMetaCallback(imageElement);
    } else {
      const metadata = JSON.parse(data);
      const stream = getBestStream(metadata);
      const fileDuration: number = getFileDuration(metadata);

      const duration = Math.round(fileDuration) || 0;
      const origWidth = stream.width || 0; // ffprobe does not detect it on some MKV streams
      const origHeight = stream.height || 0;

      const stat = fs.statSync(filePath);

      imageElement.duration = duration;
      imageElement.fileSize = stat.size;
      imageElement.mtime = stat.mtimeMs;
      imageElement.ctime = stat.ctimeMs;
      if (imageElement.hash === '') {
        imageElement.hash = hashFile(filePath);
      }
      imageElement.height = origHeight;
      imageElement.width = origWidth;
      imageElement.screens = computeNumberOfScreenshots(screenshotSettings, duration);

      extractMetaCallback(imageElement);
    }
  });
}


/**
 * Update the entire array with new hashes
 *
 * @param imageArray
 * @param videoFolderPath
 */
export function updateArrayWithHashes(
  imageArray: ImageElement[],
  videoFolderPath: string
) {
  imageArray.forEach((element) => {
    const filePath = path.join(videoFolderPath, element.partialPath, element.fileName);
    element.hash = hashFile(filePath);
  });
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
      const pathStripped = newElement.partialPath.replace(inputFolder, '');
      if (pathStripped === oldElement.partialPath && newElement.fileName === oldElement.fileName) {
        matchFound = true;
        newElement.hash = oldElement.hash;
      }
    });

    if (!matchFound) { // means new element !!!
      const filePath = path.join(inputFolder, newElement.partialPath, newElement.fileName);
      newElement.hash = hashFile(filePath);
      theDiff.push(newElement);
    }
  });

  return theDiff;
}



/**
 * Hash a given file using its size
 * @param pathToFile  -- path to file
 */
export function hashFile(pathToFile: string): string {
  const sampleSize = 16 * 1024;
  const sampleThreshold = 128 * 1024;
  const stats = fs.statSync(pathToFile);
  const fileSize = stats.size;

  let data: Buffer;
  if (fileSize < sampleThreshold) {
    data = fs.readFileSync(pathToFile); // too small, just read the whole file
  } else {
    data = Buffer.alloc(sampleSize * 3);
    const fd = fs.openSync(pathToFile, 'r');
    fs.readSync(fd, data, 0, sampleSize, 0);                                  // read beginning of file
    fs.readSync(fd, data, sampleSize, sampleSize, fileSize / 2);              // read middle of file
    fs.readSync(fd, data, sampleSize * 2, sampleSize, fileSize - sampleSize); // read end of file
    fs.closeSync(fd);  // if you don't close, you get `EMFILE: too many open files` error
  }

  // append the file size to the data
  const buf = Buffer.concat([data, Buffer.from(fileSize.toString())]);
  // make the magic happen!
  const hash = hasher('md5').update(buf.toString('hex')).digest('hex');
  return hash;

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
    let hashFound = false;

    hdFinalArray.forEach((newElement) => {
      if (value.hash === newElement.hash) {
        hashFound = true;
      }
      const pathStripped = newElement.partialPath.replace(inputFolder, '');
      if (pathStripped === value.partialPath && newElement.fileName === value.fileName) {
        matchFound = true;
      }
    });

    if (!hashFound) {
      deleteThumbnails(folderWhereImagesAre, value.hash);
    }
    if (matchFound) {
      return true;
    } else {
      return false;
    }
  });

  return cleanedArray;
}

/**
 * Delete thumbnails
 * @param imageLocation
 * @param hash
 */
export function deleteThumbnails(imageLocation: string, hash: string) {
  // console.log('deleting ' + hash);
  const files = [ imageLocation + '/filmstrips/' + hash + '.jpg',
                  imageLocation + '/clips/' + hash + '.mp4',
                  imageLocation + '/thumbnails/' + hash + '.jpg' ];

  files.forEach((file) => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file, (err) => {
        console.log(err);
        // Don't even sweat it dawg!
      });
      console.log('deleted ' + file);
    }
  });
}

/**
 * Returns true if there's user metadata to copy
 * @param element to check
 */
export function hasUserMetadata(
  element: ImageElement
) {
  return element.timesPlayed !== 0 ||
         element.stars !== 0.5 ||
         element.tags ||
         element.year;
}

/**
 * Copy all user metadata from oldElement to newElement
 * @param oldElement
 * @param newElement
 */
export function copyUserMetadataForFile(
  oldElement: ImageElement,
  newElement: ImageElement
) {
  newElement.stars       = oldElement.stars;
  newElement.tags        = oldElement.tags;
  newElement.timesPlayed = oldElement.timesPlayed;
  newElement.year        = oldElement.year;
}

/**
 * Copy any user entered metadata from oldArray to newArray by hash key
 * @param oldArray to copy from
 * @param newArray to copy to
 */
export function copyUserMetadata(
  oldArray: ImageElement[],
  newArray: ImageElement[]
) {
  oldArray.forEach((oldElement) => {
    if (hasUserMetadata(oldElement)) {
      newArray.forEach((newElement) => {
        if (oldElement.hash === newElement.hash) {
          copyUserMetadataForFile(oldElement, newElement);
        }
      });
    }
  });
}
