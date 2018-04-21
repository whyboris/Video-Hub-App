import { app, BrowserWindow, screen } from 'electron';
import * as path from 'path';

// ========================================================================================
// ****************************************************************************************
// DEMO VARIABLE !!!
const demo = false;
// DEMO VARIABLE !!!
// ****************************************************************************************
// ========================================================================================

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

if (serve) {
  require('electron-reload')(__dirname, {
  });
}

// MY IMPORTANT IMPORT !!!!
const dialog = require('electron').dialog;

let userWantedToOpen = null;
let myWindow = null

// For windows -- when loading the app the first time
if (process.argv[1]) {
  if (!serve) {
    userWantedToOpen = process.argv[1];
  }
}

// OPEN FILE ON WINDOWS FROM FILE DOUBLE CLICK
const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {

  // dialog.showMessageBox({
  //   message: 'hello \n' +
  //   commandLine[0] + ' \n' +
  //   commandLine[1] + ' \n' +
  //   workingDirectory + ' !!! ',
  //   buttons: ['OK']
  // });

  if (commandLine[1]) {
    userWantedToOpen = commandLine[1];
    openThisDamnFile(commandLine[1]);
  }

  // Someone tried to run a second instance, we should focus our window.
  if (myWindow) {
    if (myWindow.isMinimized()) {
      myWindow.restore();
    }
    myWindow.focus();
  }
});

if (isSecondInstance) {
  // quit the second instance
  app.exit();
  // app.quit();
}

function createWindow() {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  const xPos = 0;
  const yPos = 0;
  const appWidth = size.width;
  const appHeight = size.height;

  // let xPos: number;
  // let yPos: number;
  // let appWidth: number;
  // let appHeight: number;

  // if (size.width < 1281) {
  //   xPos = 100;
  //   yPos = 30;
  //   appWidth = size.width - 200;
  //   appHeight = size.height - 60;
  // } else if (size.width < 1921) {
  //   xPos = 200;
  //   yPos = 100;
  //   appWidth = size.width - 400;
  //   appHeight = size.height - 200;
  // } else {
  //   xPos = 400;
  //   yPos = 200;
  //   appWidth = size.width - 800;
  //   appHeight = size.height - 400;
  // }

  // Create the browser window.
  win = new BrowserWindow({
    x: xPos,
    y: yPos,
    width: appWidth,
    height: appHeight,
    center: true,
    // width: 830,
    // height: 600,
    minWidth: 420,
    minHeight: 250,
    icon: path.join(__dirname, 'assets/icons/png/64x64.png'),
    // removes the frame from the window completely !!!
    frame: false
  });

  myWindow = win;

  // and load the index.html of the app.
  win.loadURL('file://' + __dirname + '/index.html');

  // Open the DevTools.
  if (serve) {
    win.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  // Does not seem to be needed to remove all the Mac taskbar menu items
  // win.setMenu(null);
}

// variable to detect if it's the first time mac is opening the file
// or something like that
let macFirstRun = true;

try {

  // OPEN FILE ON MAC FROM FILE DOUBLE CLICK
  // THIS RUNS (ONLY) on MAC !!!
  app.on('will-finish-launching', function () {
    app.on('open-file', (event, filePath) => {
      if (filePath) {
        userWantedToOpen = filePath;
        if (!macFirstRun) {
          openThisDamnFile(filePath);
        }
      }
    });
  });

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    // if (process.platform !== 'darwin') {
    app.quit();
    // }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}

// ============================================================
// My imports
// ============================================================

const fs = require('fs');

const ipc = require('electron').ipcMain;
const shell = require('electron').shell;

const ffprobePath = require('@ffprobe-installer/ffprobe').path.replace('app.asar', 'app.asar.unpacked');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path.replace('app.asar', 'app.asar.unpacked');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfprobePath(ffprobePath);
ffmpeg.setFfmpegPath(ffmpegPath);

// ============================================================
// My variables
// ============================================================

import {
  alphabetizeFinalArray,
  countFoldersInFinalArray,
  everyIndex,
  extractFileName,
  finalArrayWithoutDeleted,
  findAllNewFiles,
  getVideoPathsAndNames,
  labelVideo,
  numberOfVidsIn,
  onlyNewIndexes,
  superDangerousDelete,
  takeTenScreenshots,
  writeVhaFileDangerously
} from './main-support';

import { FinalObject, ImageElement } from './src/app/components/common/final-object.interface';
import { ImportSettingsObject } from './src/app/components/common/import.interface';

let angularApp; // set as 'event' -- used to send messages back to Angular App
let finalArray: ImageElement[] = [];

let cancelCurrentImport = false;
let currentlyOpenVhaFile: string; // OFFICAL DECREE IN NODE WHICH FILE IS CURRENTLY OPEN !!!
let firstScan: boolean = true;
let hubFolderNameForSaving = ''; // will be something like `vha-hubName`
let hubName = 'untitled'; // in case user doesn't name their hub any name
let lastSavedFinalObject: FinalObject; // hack for saving the `vha` file again later
let screenShotSize = 100;
let selectedOutputFolder = '';
let selectedSourceFolder = '';
let stillNeedToExtractImages = false;

// ##################################################################################
// TODO -- clean this up -- I think I only need 2 !!!
// the new thing that is incremented to indicate file # (for finalArray[3])
let findAllIndexesAbove: number = 0;
let lastScreenFromLastOpenFile: number = 0;
let newLastScreenCounterNEW: number = 0;
// ##################################################################################

/**
 * Load the .vha file and send it to app
 * @param pathToVhaFile full path to the .vha file
 */
function openThisDamnFile(pathToVhaFile: string) {

  // TODO ### !!! figure out how to open file when double click first time
  macFirstRun = false;

  // Override if user opening by double-clicking a file
  if (userWantedToOpen) {
    pathToVhaFile = userWantedToOpen;
  }

  console.log('the app is about to open: ' + pathToVhaFile);

  fs.readFile(pathToVhaFile, (err, data) => {
    if (err) {
      dialog.showMessageBox({
        message: 'No such file found \n' +
          pathToVhaFile,
        buttons: ['OK']
      });
      angularApp.sender.send('pleaseOpenWizard');
    } else {
      currentlyOpenVhaFile = pathToVhaFile;
      lastSavedFinalObject = JSON.parse(data);
      setGlobalsFromVhaFile(lastSavedFinalObject); // sets source folder ETC

      // path to folder where the VHA file is
      selectedOutputFolder = path.parse(pathToVhaFile).dir;

      console.log(selectedSourceFolder + ' - videos location');
      console.log(selectedOutputFolder + ' - output location');
      angularApp.sender.send(
        'finalObjectReturning', JSON.parse(data), pathToVhaFile, extractFileName(pathToVhaFile)
      );
    }
  });
}

function setGlobalsFromVhaFile(vhaFileContents: FinalObject) {
  hubName = vhaFileContents.hubName,
  lastScreenFromLastOpenFile = vhaFileContents.lastScreen;
  screenShotSize = vhaFileContents.ssSize;
  selectedSourceFolder = vhaFileContents.inputDir;
}


// ============================================================
// Methods that interact with Angular
// ============================================================

const pathToAppData = app.getPath('appData');

/**
 * Close the window
 */
ipc.on('close-window', function (event, settingsToSave, finalArrayToSave) {

  const json = JSON.stringify(settingsToSave);

  try {
    fs.statSync(path.join(pathToAppData, 'video-hub-app'));
  } catch (e) {
    fs.mkdirSync(path.join(pathToAppData, 'video-hub-app'));
  }

  // TODO -- catch bug if user closes before selecting the output folder ?!??
  fs.writeFile(path.join(pathToAppData, 'video-hub-app', 'settings.json'), json, 'utf8', () => {
    if (finalArrayToSave !== null) {
      lastSavedFinalObject.images = finalArrayToSave;
      writeVhaFileDangerously(lastSavedFinalObject, currentlyOpenVhaFile, () => {
        // file writing done !!!
        console.log('.vha file written before closing !!!');
        BrowserWindow.getFocusedWindow().close();
      });
    } else {
      BrowserWindow.getFocusedWindow().close();
    }
  });
});

/**
 * Just started -- hello -- send over the settings
 */
ipc.on('just-started', function (event, someMessage) {
  angularApp = event;

  fs.readFile(path.join(pathToAppData, 'video-hub-app', 'settings.json'), (err, data) => {
    if (err) {
      event.sender.send('pleaseOpenWizard');
    } else {
      event.sender.send('settingsReturning', JSON.parse(data), userWantedToOpen);
    }
  });
});

/**
 * Maximize the window
 */
ipc.on('maximize-window', function (event, someMessage) {
  if (BrowserWindow.getFocusedWindow()) {
    BrowserWindow.getFocusedWindow().maximize();
  }
});

/**
 * Un-Maximize the window
 */
ipc.on('un-maximize-window', function (event, someMessage) {
  if (BrowserWindow.getFocusedWindow()) {
    BrowserWindow.getFocusedWindow().unmaximize();
  }
});

/**
 * Minimize the window
 */
ipc.on('minimize-window', function (event, someMessage) {
  if (BrowserWindow.getFocusedWindow()) {
    BrowserWindow.getFocusedWindow().minimize();
  }
});

/**
 * Summon system modal to choose INPUT directory
 * where all the videos are located
 */
ipc.on('choose-input', function (event, someMessage) {
  dialog.showOpenDialog({
    properties: ['openDirectory']
  }, function (files) {
    if (files) {
      const inputDirPath: string = files[0];
      event.sender.send('inputFolderChosen', inputDirPath, numberOfVidsIn(inputDirPath));
    }
  })
});

/**
 * Summon system modal to choose OUTPUT directory
 * where the final json and all screenshots will be saved
 */
ipc.on('choose-output', function (event, someMessage) {
  dialog.showOpenDialog({
    properties: ['openDirectory']
  }, function (files) {
    if (files) {
      const outputDirPath = files[0];
      event.sender.send('outputFolderChosen', outputDirPath);
    }
  })
});

/**
 * Start extracting the screenshots into a chosen output folder from a chosen input folder
 */
ipc.on('start-the-import', function (event, options: ImportSettingsObject) {

  const outDir: string = options.exportFolderPath;

  // make sure no hub name under the same name exists
  if (fs.existsSync(path.join(outDir, options.hubName + '.vha'))) {

    dialog.showMessageBox({
      message: 'Hub already exists with this name. \n' +
        'Please change the hub name above',
      buttons: ['OK']
    });

    event.sender.send('pleaseFixHubName');

  } else {

    // create the folder `vha-hubName` inside the output directory
    if (!fs.existsSync(path.join(outDir, 'vha-' + options.hubName))) {
      console.log('vha-hubName folder did not exist, creating');
      fs.mkdirSync(path.join(outDir, 'vha-' + options.hubName));
    }

    hubFolderNameForSaving = 'vha-' + options.hubName;

    selectedOutputFolder = options.exportFolderPath;
    selectedSourceFolder = options.videoDirPath;
    screenShotSize = options.imgHeight;
    hubName = options.hubName;

    importNewHub();
  }

});

/**
 * Start importing new hub
 * Resets variables
 * Builds finalArray based on files
 * Calls `extractAllMetadata` to extract metadata
 */
function importNewHub() {
  // RESET EVERY GLOBAL VARIABLE
  cancelCurrentImport = false;
  finalArray = [];
  firstScan = true;
  newLastScreenCounterNEW = 0;    // TODO -- check this variable name across the file
  stillNeedToExtractImages = true;
  
  // generate ImageElement[] with filenames and paths & empty metadata
  finalArray = getVideoPathsAndNames(selectedSourceFolder);

  if (demo) {
    finalArray = finalArray.slice(0, 50);
  }

  lastScreenFromLastOpenFile = finalArray.length; // TODO -- check this variable name across the file

  extractAllMetadata(selectedSourceFolder, 0, () => {
    // call back when done
    console.log('DONE EXTRACTING METADATA !!!');
    console.log(finalArray);
    sendFinalResultHome();
  });
}

/**
 * Initiate rescan of the directory NEW
 * now receives the finalArray from `home.component`
 * because the user may have renamed files from within the app!
 */
ipc.on('rescan-current-directory', function (event, currentAngularFinalArray: ImageElement[]) {
  reScanDirectory(currentAngularFinalArray);
});

/**
 * Begins rescan procedure compared to what the app has currently
 * 
 * @param angularFinalArray 
 */
function reScanDirectory(angularFinalArray: ImageElement[]) {
  firstScan = false;
  hubFolderNameForSaving = 'vha-' + hubName; // maybe not needed -- check it

  const inputFolder = selectedSourceFolder; // DOUBLE CHECK THIS !!!!!!!!!!!!!!!!!!!!!!! global variable danger
  console.log('reScanDirectory runnnig:');
  console.log(angularFinalArray);

  // rescan the source directory
  if (fs.existsSync(inputFolder)) {
    finalArray = getVideoPathsAndNames(inputFolder); // this method updates the `finalArray`
    if (demo) {
      finalArray = finalArray.slice(0, 50);
    }
    updateFinalArrayWithHD(angularFinalArray, finalArray, inputFolder);
  } else {
    dialog.showMessageBox({
      message: 'Directory ' + inputFolder + ' does not exist',
      buttons: ['OK']
    });
  }
}

/**
 * Summon system modal to choose the *.vha file
 * send images object to App
 * send settings object to App
 */
ipc.on('system-open-file-through-modal', function (event, somethingElse) {
  dialog.showOpenDialog({
      title: 'Please select a previously-saved Video Hub file',
      filters: [{
        name: 'Video Hub files',
        extensions: ['vha']
      }],
      properties: ['openFile']
    }, function (files) {
      if (files) {
        // console.log('the user has chosen this previously-saved .vha file: ' + files[0]);
        // TODO: maybe ??? check if file ends in .vha before parsing !!
        // TODO: fix up this stupid pattern of overriding method with variable !!!
        userWantedToOpen = files[0];
        openThisDamnFile(files[0]);
      }
    });
});

/**
 * Import this .vha file
 */
ipc.on('load-this-vha-file', function (event, pathToVhaFile, finalArrayToSave: ImageElement[]) {

  if (finalArrayToSave !== null) {
    lastSavedFinalObject.images = finalArrayToSave;
    writeVhaFileDangerously(lastSavedFinalObject, currentlyOpenVhaFile, () => {
      // file writing done !!!
      console.log('.vha file written !!!');
      userWantedToOpen = pathToVhaFile;
    openThisDamnFile(pathToVhaFile);
    });
  } else {
    // TODO -- streamline this variable and openThisDamnFileFunction
    userWantedToOpen = pathToVhaFile;
    openThisDamnFile(pathToVhaFile);
  }

});

/**
 * Open a particular video file clicked inside Angular
 */
ipc.on('openThisFile', function (event, fullFilePath) {
  shell.openItem(fullFilePath);
});

/**
 * Open the explorer to the relevant file
 */
ipc.on('openInExplorer', function(event, fullPath: string) {
  shell.showItemInFolder(fullPath);
});

/**
 * Open a URL in system's default browser
 */
ipc.on('pleaseOpenUrl', function(event, url: string): void {
  shell.openExternal(url, { activate: true }, (): void => {});
});

/**
 * Interrupt current import process
 */
ipc.on('cancel-current-import', function(event): void {
  cancelCurrentImport = true;
});

ipc.on('try-to-rename-this-file', function(event, sourceFolder: string, relPath: string, file: string, renameTo: string): void {
  console.log('renaming file:');

  const original: string = path.join(sourceFolder, relPath, file);
  const newName: string = path.join(sourceFolder, relPath, renameTo);

  console.log(original);
  console.log(newName);

  let success: boolean = true;
  let errMsg: string;

  // check if already exists first
  if (fs.existsSync(newName)) {
    console.log('some file already EXISTS WITH THAT NAME !!!');
    success = false;
    errMsg = "A file existst with this filename";
  } else {
    try {
      fs.renameSync(original, newName);
    } catch (err) {
      success = false;
      console.log(err);
      if (err.code === 'ENOENT') {
        // const pathObj = path.parse(err.path);
        // console.log(pathObj);
        errMsg = "Original file could not be found";        
      } else {
        errMsg = "Some error occurred";
      }
    }
  }

  angularApp.sender.send('renameFileResponse', success, errMsg);
});

// ============================================================
// Methods to extract screenshots, build file list, etc
// ============================================================

/**
 * Sends progress to Angular App
 * @param current number
 * @param total number
 * @param stage number
 */
function sendCurrentProgress(current: number, total: number, stage: number): void {
  angularApp.sender.send('processingProgress', current, total, stage);
}

/**
 * Writes the json file and sends contents back to Angular App
 * Starts the process to extract all the images
 */
function sendFinalResultHome(): void {

  finalArray = alphabetizeFinalArray(finalArray);

  const finalObject: FinalObject = {
    hubName: hubName,
    images: finalArray,
    inputDir: selectedSourceFolder,
    lastScreen: lastScreenFromLastOpenFile, // FIX THIS UP !!! #######
    numOfFolders: countFoldersInFinalArray(finalArray),
    ssSize: screenShotSize,
  };

  lastSavedFinalObject = finalObject;

  console.log('about to SEND THIS HOME:');
  console.log(lastSavedFinalObject);
  console.log('check `lastScreen` above !!!! should be not wrong !!!:');

  const json = JSON.stringify(finalObject);

  // TODO -- BUG HERE EVER !!!?!!!???!!?????
  const pathToTheFile = path.join(selectedOutputFolder, hubName + '.vha');

  writeVhaFileDangerously(finalObject, pathToTheFile, () => {

    currentlyOpenVhaFile = pathToTheFile;

    // when done, perform this !!!
    angularApp.sender.send(
      'finalObjectReturning', JSON.parse(json), pathToTheFile, extractFileName(pathToTheFile)
    );

    if (stillNeedToExtractImages) {
      const screenshotOutputFolder: string = path.join(selectedOutputFolder, hubFolderNameForSaving);

      // *** SUPER DANGEROUS USES `newLastScreenCounterNEW` ####
      const indexesToScan: number[] = firstScan ? 
                                          everyIndex(finalArray) 
                                        : onlyNewIndexes(finalArray, findAllIndexesAbove); // #####

      console.log('indexes to scan');
      console.log(indexesToScan);

      extractAllScreenshots(finalArray, selectedSourceFolder, screenshotOutputFolder, screenShotSize, indexesToScan);
    }

  });
}

// DANGEROUSLY DEPENDS ON `cancelCurrentImport` -- can't move to another file

/**
 * Start extracting screenshots now that metadata has been retreived and sent over to the app
 * @param theFinalArray     -- finalArray of ImageElements
 * @param videoFolderPath   -- path to base folder where videos are
 * @param screenshotFolder  -- path to folder where .jpg files will be saved
 * @param screenshotSize    -- number in px how large each screenshot should be
 * @param elementsToScan    -- array of indexes of elements in finalArray for which to extract screenshots 
 */
function extractAllScreenshots(
  theFinalArray: ImageElement[],
  videoFolderPath: string, 
  screenshotFolder: string, 
  screenshotSize: number, 
  elementsToScan: number[]
): void {
  // final array already saved at this point - nothing to update inside it
  // just walk through whatever is needed and extract screenshots
  // from every file inside the array
  const itemTotal = elementsToScan.length;
  let iterator = -1; // gets incremented to 0 on first call

  const extractTenCallback = (): void => {
    iterator++;
    
    if ((iterator < itemTotal) && !cancelCurrentImport) {

      sendCurrentProgress(iterator, itemTotal, 2);

      const currentElement = elementsToScan[iterator];

      const pathToVideo: string = (path.join(videoFolderPath,
                                             theFinalArray[currentElement][0],
                                             theFinalArray[currentElement][1]));

      const jpgFileNum: number = theFinalArray[currentElement][3]; 

      takeTenScreenshots(
        pathToVideo,
        jpgFileNum,
        screenshotSize,
        screenshotFolder,
        extractTenCallback
      );
    } else {
      sendCurrentProgress(1, 1, 2); // indicates 100%
    }
  }

  extractTenCallback();
}

/**
 * Extract the meta data & store it in the final array
 * @param videoFolderPath -- the full path to the base folder for video files
 * @param startIndex      -- the starting point in finalArray from where to extract metadata
 *                           (should be 0 when first scan, should be index of first element when rescan)
 * @param doneExtractingAllMetadata -- callback when done with all metadata extraction
 */
function extractAllMetadata(
    videoFolderPath: string, 
    startIndex: number,
    doneExtractingAllMetadata: any
  ): void {

  const itemTotal = finalArray.length;
  let iterator = startIndex - 1; // since iterator gets incremented upon first call below

  const extractMetaDataCallback = (): void => {
    iterator++;
    
    if (iterator < itemTotal) {
      // send current progress to the first progress bar !?!! somehow
      const filePathNEW = (path.join(videoFolderPath,
                                     finalArray[iterator][0],
                                     finalArray[iterator][1]));
      extractMetadataForThisONEFile(filePathNEW, iterator, extractMetaDataCallback);
    } else {
      // something else !!?!?!??!!!!  
      doneExtractingAllMetadata();
    }
  }

  extractMetaDataCallback();
}

/**
 * Updates the finalArray with the metadata about one particualar requested file
 * Updates newLastScreenCounterNEW global variable !!!
 * @param filePath      path to the file
 * @param indexInArray  index in array to update
 */
function extractMetadataForThisONEFile(
  filePath: string, 
  indexInArray: number, 
  extractMetaCallback: any
): void {
  ffmpeg.ffprobe(filePath, (err, metadata) => {
    if (err) {
      extractMetaCallback();
    } else {
      const duration = Math.round(metadata.streams[0].duration) || 0;
      const origWidth = metadata.streams[0].width;
      const origHeight = metadata.streams[0].height;
      const sizeLabel = labelVideo(origWidth, origHeight);
      const width = Math.round(100 * origWidth / origHeight) || 169;
      finalArray[indexInArray][3] = newLastScreenCounterNEW;    // 3rd item is the FILE NUMBER !!! IMPORTANT !!!
      newLastScreenCounterNEW++;
      finalArray[indexInArray][4] = duration;  // 4th item is duration
      finalArray[indexInArray][5] = sizeLabel; // 5th item is the label, e.g. 'HD'
      finalArray[indexInArray][6] = width;     // 6th item is width of screenshot (130) for ex

      // extract the file size
      const stats = fs.statSync(filePath);
      const fileSizeInBytes = stats.size;
      // Convert the file size to megabytes
      const fileSizeInMegabytes = Math.round(fileSizeInBytes / 1000000.0);

      finalArray[indexInArray][7] = fileSizeInMegabytes;
      extractMetaCallback();
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
 * @param angularFinalArray -- array of ImageElements from Angular - most current view
 * @param hdFinalArray  -- array of ImageElements from current hard drive scan
 * @param inputFolder   -- the input folder
 */
function updateFinalArrayWithHD(
  angularFinalArray: ImageElement[],
  hdFinalArray: ImageElement[],
  inputFolder: string
): void {

  // SUPER DANGEROUS FIX:
  newLastScreenCounterNEW = lastSavedFinalObject.lastScreen;

  // Generate ImageElement[] of all the new elements to be added
  // #############################################################################
  const onlyNewElements: ImageElement[] = 
    findAllNewFiles(angularFinalArray, hdFinalArray, inputFolder, lastSavedFinalObject.lastScreen);

  console.log('all the new videos detected:');
  console.log(onlyNewElements);

  // TODO -- clean up all of below
  findAllIndexesAbove = lastScreenFromLastOpenFile; // hack for now -- only extract meta for those above this #

  lastScreenFromLastOpenFile = lastScreenFromLastOpenFile + onlyNewElements.length; // update last screen!!!

  // remove from FinalArray all files that are no longer in the video folder

  // location where images are stored
  const folderToDeleteFrom = path.join(selectedOutputFolder, hubFolderNameForSaving);

  // #############################################################################
  const angularArrayCleanedOfDeletedItems: ImageElement[] = 
    finalArrayWithoutDeleted(angularFinalArray, hdFinalArray, inputFolder, folderToDeleteFrom);

  // If there are new ifles OR if any files have been deleted !!!
  if (onlyNewElements.length > 0 || angularArrayCleanedOfDeletedItems.length < angularFinalArray.length) {

    // update the ACTUAL FINAL ARRY -- for NODE TO SAVE !!!!! ### REFACTOR ??? !!!
    finalArray = angularArrayCleanedOfDeletedItems.concat(onlyNewElements);
    // final array now has new elements appended at the end !!!
  
    console.log('find all indexes above:');
    console.log(findAllIndexesAbove);
    console.log('last screen before:');
    console.log(lastScreenFromLastOpenFile);
    
    const startingPointForMetaScan = angularFinalArray.length; // check this is correct
    
    console.log('the diff is ' + onlyNewElements.length + ' elements long!');
    
    stillNeedToExtractImages = true;

    extractAllMetadata(selectedSourceFolder, startingPointForMetaScan, () => {
      console.log('extracted all metadata now !!!');
      console.log(finalArray);
      sendFinalResultHome();
    });

  }

}


