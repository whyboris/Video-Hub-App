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
  extractAllMetadata,
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

let cancelCurrentImport = false;
let currentlyOpenVhaFile: string; // OFFICAL DECREE IN NODE WHICH FILE IS CURRENTLY OPEN !!!
let firstScan: boolean = true;
let hubName = 'untitled'; // in case user doesn't name their hub any name
let lastSavedFinalObject: FinalObject; // hack for saving the `vha` file again later
let screenShotSize = 100;
let selectedOutputFolder = '';
let selectedSourceFolder = '';
let lastScreenFromLastOpenFile: number = 0; // for `finalArray[3]`
let indexesAboveWhichToScan: number = 0;

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
  firstScan = true;
  
  // generate ImageElement[] with filenames and paths & empty metadata
  let videoFilesWithPaths: ImageElement[] = getVideoPathsAndNames(selectedSourceFolder);

  if (demo) {
    videoFilesWithPaths = videoFilesWithPaths.slice(0, 50);
  }

  lastScreenFromLastOpenFile = videoFilesWithPaths.length;

  extractAllMetadata(videoFilesWithPaths, selectedSourceFolder, 0, sendFinalResultHome);

}

/**
 * Initiate rescan of the directory NEW
 * now receives the finalArray from `home.component`
 * because the user may have renamed files from within the app!
 */
ipc.on('rescan-current-directory', function (event, currentAngularFinalArray: ImageElement[]) {
  const currentVideoFolder = selectedSourceFolder; // DOUBLE CHECK THIS !!!!!! global variable danger
  reScanDirectory(currentAngularFinalArray, currentVideoFolder);
});

/**
 * Begins rescan procedure compared to what the app has currently
 * 
 * @param angularFinalArray  ImageElment[] from Angular (might have renamed files)
 */
function reScanDirectory(angularFinalArray: ImageElement[], currentVideoFolder: string) {
  firstScan = false;                                            // can't factor out because toggles `firstScan`

  // rescan the source directory
  if (fs.existsSync(currentVideoFolder)) {
    let videosOnHD: ImageElement[] = getVideoPathsAndNames(currentVideoFolder); // this method updates the `finalArray`
    if (demo) {
      videosOnHD = videosOnHD.slice(0, 50);
    }
    updateFinalArrayWithHD(angularFinalArray, videosOnHD, currentVideoFolder);
  } else {
    dialog.showMessageBox({
      message: 'Directory ' + currentVideoFolder + ' does not exist',
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
 * @param theFinalArray -- `finalArray` with all the metadata filled in
 */
function sendFinalResultHome(theFinalArray: ImageElement[]): void {

  const myFinalArray: ImageElement[] = alphabetizeFinalArray(theFinalArray);

  const finalObject: FinalObject = {
    hubName: hubName,
    inputDir: selectedSourceFolder,
    numOfFolders: countFoldersInFinalArray(myFinalArray),
    ssSize: screenShotSize,
    lastScreen: lastScreenFromLastOpenFile,
    images: myFinalArray,
  };

  lastSavedFinalObject = finalObject;

  const json = JSON.stringify(finalObject);

  const pathToTheFile = path.join(selectedOutputFolder, hubName + '.vha');

  writeVhaFileDangerously(finalObject, pathToTheFile, () => {

    currentlyOpenVhaFile = pathToTheFile;

    // when done, perform this !!!
    angularApp.sender.send(
      'finalObjectReturning', JSON.parse(json), pathToTheFile, extractFileName(pathToTheFile)
    );

    const screenshotOutputFolder: string = path.join(selectedOutputFolder, hubFolderName());

    const indexesToScan: number[] = firstScan ? 
                                        everyIndex(myFinalArray) 
                                      : onlyNewIndexes(myFinalArray, indexesAboveWhichToScan);

    extractAllScreenshots(myFinalArray, selectedSourceFolder, screenshotOutputFolder, screenShotSize, indexesToScan);

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
  // just walk through `elementsToScan` to extract screenshots for elements in `theFinalArray`
  const itemTotal = elementsToScan.length;
  let iterator = -1; // gets incremented to 0 on first call

  const extractTenCallback = (): void => {
    iterator++;
    
    if ((iterator < itemTotal) && !cancelCurrentImport) { // can't move to main-support because of `cancelCurrentImport`

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

  // Generate ImageElement[] of all the new elements to be added
  // #############################################################################
  const onlyNewElements: ImageElement[] = 
    findAllNewFiles(angularFinalArray, hdFinalArray, inputFolder, lastScreenFromLastOpenFile);

  // console.log('all the new videos detected:');
  // console.log(onlyNewElements);

  indexesAboveWhichToScan = lastScreenFromLastOpenFile;
  lastScreenFromLastOpenFile = lastScreenFromLastOpenFile + onlyNewElements.length; // update last screen!!!

  // location where images are stored
  const folderToDeleteFrom = path.join(selectedOutputFolder, hubFolderName());
  
  // remove from FinalArray all files that are no longer in the video folder
  // #############################################################################
  const angularArrayCleanedOfDeletedItems: ImageElement[] = 
    finalArrayWithoutDeleted(angularFinalArray, hdFinalArray, inputFolder, folderToDeleteFrom);

  // If there are new ifles OR if any files have been deleted !!!
  if (onlyNewElements.length > 0 || angularArrayCleanedOfDeletedItems.length < angularFinalArray.length) {

    const finalArrayUpdated = angularArrayCleanedOfDeletedItems.concat(onlyNewElements);
    // final array COPY now has new elements appended at the end !!!
  
    const startingPointForMetaScan = angularArrayCleanedOfDeletedItems.length; // check this is correct
    
    console.log('the diff is ' + onlyNewElements.length + ' elements long!');
    
    extractAllMetadata(finalArrayUpdated, selectedSourceFolder, startingPointForMetaScan, sendFinalResultHome);

  }

}

/**
 * Return the name of the folder where images will be saved
 * DANGEROUS -- relies on `hubName` to be set properly (currently is)
 */
function hubFolderName(): string {
  return 'vha-' + hubName;
}
