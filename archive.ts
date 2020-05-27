
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
