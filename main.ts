import { app, BrowserWindow, screen } from 'electron';
import * as path from 'path';

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

  let xPos: number;
  let yPos: number;
  let appWidth: number;
  let appHeight: number;

  if (size.width < 1281) {
    xPos = 100;
    yPos = 50;
    appWidth = size.width - 200;
    appHeight = size.height - 100;
  } else if (size.width < 1921) {
    xPos = 200;
    yPos = 150;
    appWidth = size.width - 400;
    appHeight = size.height - 300;
  } else {
    xPos = 400;
    yPos = 300;
    appWidth = size.width - 800;
    appHeight = size.height - 600;
  }

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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

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

// DEMO FLAG !!!
const demo = false;

import { cleanUpFileName, labelVideo } from './main-support';

import { FinalObject } from './src/app/components/common/final-object.interface';

let finalArray = [];
let fileCounter = 0;

let selectedSourceFolder = '';
let selectedOutputFolder = '';

let angularApp; // set as 'event' -- used to send messages back to Angular App

let stillNeedToExtractImages = false;

let hubName = 'untitled'; // in case user doesn't name their hub any name
let currentOpenVhaFilename = '';

let cancelCurrentImport = false;

// METHOD TO OPEN DOUBLE-CLICKED FILE !!!!!!!!!!!!!
function openThisDamnFile(pathToVhaFile) {

  macFirstRun = false;

  console.log('the app is about to open: ' + pathToVhaFile);

  // Override if user opening by double-clicking a file
  if (userWantedToOpen) {
    pathToVhaFile = userWantedToOpen;
  }

  fs.readFile(pathToVhaFile, (err, data) => {
    if (err) {
      dialog.showMessageBox({
        message: 'No such file found \n' +
          pathToVhaFile,
        buttons: ['OK']
      });
    } else {
      angularApp.sender.send(
        'finalObjectReturning', JSON.parse(data), pathToVhaFile, extractFileName(pathToVhaFile)
      );
    }
  });

}

// ============================================================
// Methods that interact with Angular
// ============================================================

/**
 * Close the window
 */
ipc.on('close-window', function (event, settingsToSave) {
  console.log('window closed by user');
  console.log(settingsToSave);
  console.log('closing temporarily disabled');

  const json = JSON.stringify(settingsToSave);

  const pathToAppData = app.getPath('appData')
  console.log(pathToAppData);

  try {
    fs.statSync(path.join(pathToAppData, 'video-hub-app'));
  } catch (e) {
    fs.mkdirSync(path.join(pathToAppData, 'video-hub-app'));
  }

  // TODO -- catch bug if user closes before selecting the output folder
  fs.writeFile(path.join(pathToAppData, 'video-hub-app', 'settings.json'), json, 'utf8', () => {
    console.log('settings file written:');
    BrowserWindow.getFocusedWindow().close();
  });
});

/**
 * Just started -- hello -- send over the settings
 */
ipc.on('just-started', function (event, someMessage) {
  angularApp = event;
  const pathToAppData = app.getPath('appData')
  console.log('app just started');
  fs.readFile(path.join(pathToAppData, 'video-hub-app', 'settings.json'), (err, data) => {
    if (err) {
      console.log(err); // maybe better error handling later
    } else {
      event.sender.send('settingsReturning', JSON.parse(data));
    }
  });
});

/**
 * Maximize the window
 */
ipc.on('maximize-window', function (event, someMessage) {
  console.log('window maximized by user');
  if (BrowserWindow.getFocusedWindow()) {
    BrowserWindow.getFocusedWindow().maximize();
  }
});

/**
 * Un-Maximize the window
 */
ipc.on('un-maximize-window', function (event, someMessage) {
  console.log('window maximized by user');
  if (BrowserWindow.getFocusedWindow()) {
    BrowserWindow.getFocusedWindow().unmaximize();
  }
});

/**
 * Minimize the window
 */
ipc.on('minimize-window', function (event, someMessage) {
  console.log('window minimized by user');
  if (BrowserWindow.getFocusedWindow()) {
    BrowserWindow.getFocusedWindow().minimize();
  }
});

/**
 * Summon system modal to choose INPUT directory
 * where all the videos are located
 */
ipc.on('choose-input', function (event, someMessage) {

  // ask user for input folder
  dialog.showOpenDialog({
    properties: ['openDirectory']
  }, function (files) {
    if (files) {
      console.log('the user has chosen this INPUT directory: ' + files[0]);
      selectedSourceFolder = files[0];
      console.log('the user has chosen this OUTPUT directory: ' + files[0]);
      selectedOutputFolder = files[0];
      totalNumberOfFiles = 0;
      walkAndCountSync(selectedSourceFolder, []);
      console.log(totalNumberOfFiles);
      event.sender.send('inputFolderChosen', selectedSourceFolder, totalNumberOfFiles);
    }
  })
});

/**
 * Summon system modal to choose OUTPUT directory
 * where the final json and all screenshots will be saved
 */
ipc.on('choose-output', function (event, someMessage) {

  // ask user for input folder
  dialog.showOpenDialog({
    properties: ['openDirectory']
  }, function (files) {
    if (files) {
      console.log('the user has chosen this OUTPUT directory: ' + files[0]);
      selectedOutputFolder = files[0];

      // create "/vha-images" inside the output directory it so that there is no `EEXIST` error when extracting.
      if (!fs.existsSync(path.join(selectedOutputFolder, 'vha-images'))) {
        console.log('vha-images folder did not exist, creating');
        fs.mkdirSync(path.join(selectedOutputFolder, 'vha-images'));
      }

      // store the reference to the Angular app
      angularApp = event;

      event.sender.send('outputFolderChosen', selectedOutputFolder);
    }
  })
});

/**
 * Start extracting the screenshots into a chosen output folder from a chosen input folder
 */
ipc.on('start-the-import', function (event, options) {
  screenShotSize = options.imgHeight;
  hubName = options.hubName;
  theExtractor('freshStart');
});

/**
 * Initiate rescan of the directory
 */
ipc.on('rescan-current-directory', function (event, inputAndVhaFile) {
  angularApp = event;
  currentOpenVhaFilename = extractFileName(inputAndVhaFile.pathToVhaFile);
  reScanDirectory(inputAndVhaFile.inputFolder, inputAndVhaFile.pathToVhaFile);
});

/**
 * Summon system modal to choose the *.vha file
 * send images object to App
 * send settings object to App
 */
ipc.on('system-open-file-through-modal', function (event, somethingElse) {
  angularApp = event;

  dialog.showOpenDialog({
      title: 'Please select a previously-saved Video Hub file',
      filters: [{
        name: 'Video Hub files',
        extensions: ['vha']
      }],
      properties: ['openFile']
    }, function (files) {
      if (files) {
        console.log('the user has chosen this previously-saved .vha file: ' + files[0]);
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
ipc.on('load-this-vha-file', function (event, pathToVhaFile) {
  // TODO -- streamline this variable and openThisDamnFileFunction
  userWantedToOpen = pathToVhaFile;
  angularApp = event;
  openThisDamnFile(pathToVhaFile);
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
  console.log('trying to open in explorer');
  console.log(fullPath);
  shell.showItemInFolder(fullPath);
});

ipc.on('pleaseOpenUrl', function(event, url: string): void {
  console.log(url);
  shell.openExternal(url, { activate: true }, (): void => {});
});

ipc.on('cancel-current-import', function(event): void {
  cancelCurrentImport = true;
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

type ExtractionMode = 'firstScan' | 'reScan';

let extractionMode: ExtractionMode = 'firstScan';

/**
 * Writes the json file and sends contents back to Angular App
 * Note: this happens before screenshots start getting extracted !!!
 */
function sendFinalResultHome(): void {

  alphabetizeFinalArray();

  const finalObject: FinalObject = {
    hubName: hubName,
    ssSize: screenShotSize,
    numOfFolders: countFoldersInFinalArray(),
    inputDir: selectedSourceFolder,
    lastScreen: MainCounter.screenShotFileNumber, // REPRESENTS NEXT AVAILABLE NUMBER FOR THE TAKING
    images: finalArray
  };

  const json = JSON.stringify(finalObject);
  // write the file
  // TODO -- hubName never used -- error because previous file loaded !!! ???
  const pathToTheFile = path.join(selectedOutputFolder, (currentOpenVhaFilename || hubName) + '.vha');
  fs.writeFile(pathToTheFile, json, 'utf8', () => {
    console.log('file written:');
    angularApp.sender.send(
      'finalObjectReturning', JSON.parse(json), pathToTheFile, extractFileName(pathToTheFile)
    );

    if (stillNeedToExtractImages) {
      if (extractionMode === 'firstScan') {
        startExtractingAllScreenshots();
      } else {
        newRescanExtractor();
      }
    }

  });

}

import { MainCounter } from './main-counter';

type ExtractorMessage = 'screenShotExtracted'
                      | 'metaExtracted'
                      | 'metaError'
                      | 'freshStart';

/**
 * Master directing screenshot and meta extraction flow
 * @param message what event has finished
 * @param dataObject optional data (any)
 */
function theExtractor(message: ExtractorMessage, dataObject?: any): void {
  if (message === 'screenShotExtracted') {
    MainCounter.screenShotFileNumber++;
    extractNextMetadata();

  } else if (message === 'metaExtracted') {
    MainCounter.itemInFinalArray++;
    areWeDoneYet();

  } else if (message === 'metaError') {
    console.log('meta error !!!!!!!!!!!!!!!!!!!!!!! --- THIS SHOULD NOT HAPPEN !!!!!!!!!!!!!!!!');
    MainCounter.itemInFinalArray++;
    areWeDoneYet();

  } else if (message === 'freshStart') {

    extractionMode = 'firstScan';

    cancelCurrentImport = false;

    totalNumberToExtract = 0;
    currentScreenshotExtracting = 0;

    stillNeedToExtractImages = true;

    // reset things and launch extraction of first screenshot !!!
    finalArray = [];
    fileCounter = 0;
    MainCounter.totalNumber = 0;
    MainCounter.itemInFinalArray = 0;
    MainCounter.screenShotFileNumber = 0;
    walkSync(selectedSourceFolder, []); // walkSync updates `finalArray`
    MainCounter.totalNumber = finalArray.length;
    console.log('there are a total of: ' + MainCounter.totalNumber + ' files to be extracted');

    if (MainCounter.totalNumber > 0) {
      extractNextScreenshot();
    } else {
      // TODO: handle case when number of screenshots is zero!
      console.error('NO VIDEO FILES IN THIS DIRECTORY!');
    }

  } else {
    console.log('what did you do !?!!');
  }
}

/**
 * Check if extraction is done, if so sendResultsHome, otherwise extractNextScreenshot
 */
function areWeDoneYet(): void {
  if (MainCounter.itemInFinalArray < MainCounter.totalNumber) {
    sendCurrentProgress(MainCounter.itemInFinalArray, MainCounter.totalNumber, 1);
  } else {
    sendCurrentProgress(0, MainCounter.totalNumber, 2);
  }
  if (MainCounter.itemInFinalArray === MainCounter.totalNumber) {
    sendFinalResultHome();
  } else {
    extractNextScreenshot();
  }
}

/**
 * Extract the next screenshot
 */
function extractNextScreenshot(): void {
  finalArray[MainCounter.itemInFinalArray][3] = MainCounter.screenShotFileNumber;
  theExtractor('screenShotExtracted');
}

let screenShotSize = 100;
const count = 10;
const timestamps = ['5%', '15%', '25%', '35%', '45%', '55%', '65%', '75%', '85%', '95%'];
let i = 0;

/**
 * Take 10 screenshots of a particular file save as particular fileNumber
 * @param pathToFile
 * @param fileNumber
 * @param firstScan -- true if it's the first time, false if it's a rescan
 */
function takeTenScreenshots(pathToFile: string, fileNumber: number, firstScan: boolean) {
  if (!cancelCurrentImport) {
    ffmpeg(pathToFile)
      .screenshots({
        count: 1,
        timemarks: [timestamps[i]],
        filename: fileNumber + `-${i + 1}.jpg`,
        size: '?x' + screenShotSize
      }, path.join(selectedOutputFolder, 'vha-images'))
      .on('end', () => {
        i = i + 1;
        if (i < count) {
          takeTenScreenshots(pathToFile, fileNumber, firstScan);
        } else if (i === count) {
          i = 0;
          if (firstScan) {
            getNextTen();
          } else {
            continueReScanning();
          }
        }
      })
      .on('error', () => {
        console.log('screenshot error occurred in file #' + pathToFile);
        if (firstScan) {
          getNextTen();
        } else {
          continueReScanning();
        }
      });
  } else {
    // TODO -- NEED TO RESET EVERYTHING HERE MAYBE !?!?!?!!!!
    sendCurrentProgress(1, 1, 2);
    angularApp.sender.send('importInterrupted');
  }
}

let totalNumberToExtract = 0;
let currentScreenshotExtracting = 0;

/**
 * Start extracting screenshots now that metadata has been retreived and sent over to the app
 */
function startExtractingAllScreenshots() {
  totalNumberToExtract = finalArray.length;
  getNextTen();
}

/**
 * Extract the next 10 screenshots
 */
function getNextTen() {
  if (currentScreenshotExtracting < totalNumberToExtract) {
    sendCurrentProgress(currentScreenshotExtracting, totalNumberToExtract, 2);

    const fileNumber = finalArray[currentScreenshotExtracting][3];
    const filePath = (path.join(selectedSourceFolder,
                                finalArray[currentScreenshotExtracting][0],
                                finalArray[currentScreenshotExtracting][1]));
    takeTenScreenshots(filePath, fileNumber, true);
  } else {
    // send the last one when done !!!
    sendCurrentProgress(currentScreenshotExtracting, totalNumberToExtract, 2);
  }
  currentScreenshotExtracting++;
}

/**
 * Extract the next file's metadata
 */
function extractNextMetadata(): void {
  const index = MainCounter.itemInFinalArray;
  extractMetadata(path.join(selectedSourceFolder,
                            finalArray[index][0],
                            finalArray[index][1]));
}

/**
 * Extract filename from `path/to/the/file.vha` or `path\to\the\file.vha`
 */
function extractFileName(filePath: string): string {
  return path.parse(filePath).name;
}

/**
 * Extract the meta data & store it in the final array
 * @param filePath -- the full path to the file (including file name)
 * @param currentFile -- index of current file
 */
function extractMetadata(filePath: string): void {
  ffmpeg.ffprobe(filePath, (err, metadata) => {

    if (err) {
      console.log('ERROR - extracting metadata - ERROR');
      console.log(MainCounter.itemInFinalArray);
      theExtractor('metaError');
    } else {
      const duration = Math.round(metadata.streams[0].duration) || 0;
      const origWidth = metadata.streams[0].width;
      const origHeight = metadata.streams[0].height;
      const sizeLabel = labelVideo(origWidth, origHeight);
      const width = Math.round(100 * origWidth / origHeight) || 169;
      finalArray[MainCounter.itemInFinalArray][4] = duration;  // 4th item is duration
      finalArray[MainCounter.itemInFinalArray][5] = sizeLabel; // 5th item is the label, e.g. 'HD'
      finalArray[MainCounter.itemInFinalArray][6] = width;     // 6th item is width of screenshot (130) for ex

      // extract the file size
      const stats = fs.statSync(filePath);
      const fileSizeInBytes = stats.size;
      // Convert the file size to megabytes
      const fileSizeInMegabytes = Math.round(fileSizeInBytes / 1000000.0);

      finalArray[MainCounter.itemInFinalArray][7] = fileSizeInMegabytes;

      theExtractor('metaExtracted');
    }
  });
}


let lastScreenshotFileNumber = 0; // only used for fancy new re-scanning functionality

/**
 * Rescan the directory -- updating files etc -- SUPER COMPLICATED
 */
function reScanDirectory(inputFolder: string, pathToVhaFile: string): void {

  console.log('inputFolder: ' + inputFolder);
  console.log('vhaFile: ' + pathToVhaFile);

  fs.readFile(pathToVhaFile, (err, data) => {
    if (err) {
      console.log(err); // TODO: better error handling
    } else {
      console.log('Rescanning directory: the .vha file has been read: ----------------------------');
      const currentJson: FinalObject = JSON.parse(data);

      extractionMode = 'reScan';
      cancelCurrentImport = false;
      rescanningIndex = 0;
      indexesOfThoseToExtract = [];

      const oldFileList: any[] = currentJson.images;
      MainCounter.screenShotFileNumber = currentJson.lastScreen;

      lastScreenshotFileNumber = currentJson.lastScreen;
      selectedOutputFolder = pathToVhaFile.replace(extractFileName(pathToVhaFile) + '.vha', '');
      selectedSourceFolder = currentJson.inputDir;
      screenShotSize = currentJson.ssSize;
      hubName = currentJson.hubName;

      fileCounter = 0; // just in case

      if (fs.existsSync(inputFolder)) {
        walkSync(inputFolder, []); // this method updates the `finalArray`
        findTheDiff(oldFileList, inputFolder);
      } else {
        dialog.showMessageBox({
          message: 'Directory ' + inputFolder + ' does not exist',
          buttons: ['OK']
        });
      }
    }
  });
}

let elementsToRemove: number[] = []; // array of indexes of files to remove (that have been deleted/renamed)

/**
 * Figures out what new files there are, adds them to the finalArray, and starts extracting screenshots
 * @param oldFileList array of video files from the previously saved JSON
 * @param inputFolder the input folder
 */
function findTheDiff(oldFileList, inputFolder): void {

  const theDiff = []; // track new elements
  elementsToRemove = [];

  // Find new/renamed elements
  // Adds all the new elements to `theDiff`
  // finalArray has been updated through walkSync in reScanDirectory();
  // finalArray reflects what's currently on the HD - contains only file names
  finalArray.forEach((newElement) => {
    let matchFound = false;
    oldFileList.forEach((oldElement) => {
      const pathStripped = newElement[0].replace(inputFolder, '');
      if (pathStripped === oldElement[0] && newElement[1] === oldElement[1]) {
        matchFound = true;
      }
    });

    if (!matchFound) {
      theDiff.push(newElement);
    }
  });

  console.log(theDiff);

  // remove from FinalArray all files that are no longer in the video folder
  oldFileList = oldFileList.filter((value, index) => {
    let matchFound = false;

    finalArray.forEach((newElement) => {
      const pathStripped = newElement[0].replace(inputFolder, '');
      if (pathStripped === value[0] && newElement[1] === value[1]) {
        matchFound = true;
      }
    });

    if (matchFound) {
      return true;
    } else {
      return false;
    }
  });

  MainCounter.itemInFinalArray = oldFileList.length;
  MainCounter.filesProcessed = oldFileList.length;
  finalArray = oldFileList.concat(theDiff);
  MainCounter.totalNumber = finalArray.length;

  if (theDiff.length > 0) {
    // TODO -- FIX THIS UP REAL GOOD !!!!!!!!
    stillNeedToExtractImages = true;
    extractNextScreenshot();
  } else {
    sendFinalResultHome();
  }

}


let rescanningIndex = 0;
let indexesOfThoseToExtract = [];

/**
 * Compile an array of indexes of finalArray from which to extract images
 */
function newRescanExtractor() {

  finalArray.forEach((element, index) => {
    if (element[3] >= lastScreenshotFileNumber) {
      indexesOfThoseToExtract.push(index);
    }
  });

  console.log(indexesOfThoseToExtract);

  rescanningIndex = indexesOfThoseToExtract.length;
  continueReScanning();

}

function continueReScanning() {

  const lol = indexesOfThoseToExtract[rescanningIndex - 1];

  // check if > 0 or >= 0 !!??!!!
  if (rescanningIndex > 0) {
    sendCurrentProgress(indexesOfThoseToExtract.length - rescanningIndex, indexesOfThoseToExtract.length, 2);
    const fileNumber = finalArray[lol][3];
    const filePath = (path.join(selectedSourceFolder,
      finalArray[lol][0],
      finalArray[lol][1]));
    takeTenScreenshots(filePath, fileNumber, false);
  } else {
    // you're done !?!!!
    sendCurrentProgress(1, 1, 2);
  }

  rescanningIndex--;

}



/**
 * Alphabetizes final array, prioritizing the folder, and then filename
 */
function alphabetizeFinalArray(): void {
  finalArray.sort((x: any, y: any): number => {
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
function countFoldersInFinalArray(): number {
  const finalArrayFolderMap: Map<string, number> = new Map;
  finalArray.forEach((element) => {
    if (!finalArrayFolderMap.has(element[0])) {
      finalArrayFolderMap.set(element[0], 1);
    }
  });
  return finalArrayFolderMap.size;
}

// ---------------------- FOLDER WALKER FUNCTION --------------------------------

const acceptableFiles = ['mp4', 'mpg', 'mpeg', 'mov', 'm4v', 'avi', 'flv', 'mkv', 'wmv'];
/**
 * Recursively walk through the input directory
 * compiling files to process
 * updates the finalArray[]
 */
function walkSync(dir, filelist) {
  // console.log('walk started');
  const files = fs.readdirSync(dir);
  // console.log(files);

  files.forEach(function (file) {
    if (!file.startsWith('$') && file !== 'System Volume Information') {
      // if the item is a _DIRECTORY_
      if (fs.statSync(path.join(dir, file)).isDirectory()) {
        filelist = walkSync(path.join(dir, file), filelist);
      } else {
        const extension = file.split('.').pop();
        if (acceptableFiles.includes(extension)) {
          // before adding, remove the redundant prefix: selectedSourceFolder
          const partialPath = dir.replace(selectedSourceFolder, '');

          finalArray[fileCounter] = [partialPath, file, cleanUpFileName(file)];
          fileCounter++;
        }
      }
    }
  });

  return filelist;
};

// ------------- just figure out how many video files are in a directory ------------

let totalNumberOfFiles = 0;

/**
 * Used only to update the `totalNumberOfFiles` when user selects input folder
 */
function walkAndCountSync(dir, filelist) {
  // console.log('walk started');
  const files = fs.readdirSync(dir);
  // console.log(files);

  files.forEach(function (file: string) {
    if (!file.startsWith('$') && file !== 'System Volume Information') {
      // if the item is a _DIRECTORY_
      if (fs.statSync(path.join(dir, file)).isDirectory()) {
        filelist = walkAndCountSync(path.join(dir, file), filelist);
      } else {
        const extension = file.split('.').pop();
        if (acceptableFiles.includes(extension)) {
          totalNumberOfFiles++;
        }
      }
    }
  });

  return filelist;
};
