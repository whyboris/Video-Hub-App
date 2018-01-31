import { app, BrowserWindow, screen } from 'electron';
import * as path from 'path';

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

if (serve) {
  require('electron-reload')(__dirname, {
  });
}

// BORIS TEMP
// TODO - clean if doesn't work
let userWantedToOpen = null;

function createWindow() {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    // width: size.width,
    // height: size.height,
    center: true,
    width: 830,
    height: 600,
    minWidth: 420,
    minHeight: 250,
    icon: path.join(__dirname, 'assets/icons/png/64x64.png'),
    frame: false
    // BORIS !!! the above removes the frame from the window completely !!!
  });

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

  // BORIS !!!
  // BEFORE BUILDING !!!
  // REMOVE ALL file / edit / view / etc
  // win.setMenu(null);
}

function fileOpeningNow(pathToAppCommaPathToVhaFile: string[], pathToFolder) {
  dialog.showMessageBox({
    message: 'hello ' +
      pathToAppCommaPathToVhaFile[0] + ' ' +
      pathToAppCommaPathToVhaFile[1] + ' ' +
      pathToFolder + ' !!! ',
    buttons: ['OK'] })
}

try {

  app.makeSingleInstance(fileOpeningNow);

  // UNSURE IF WORKS
  // TODO - clean if doesn't work
  app.on('will-finish-launching', function () {

    // UNSURE IF WORKS

    app.on('open-file', (event, filePath) => {

      dialog.showMessageBox({ message: '123', buttons: ['OK'] });
      // prevent new instance ???
      event.preventDefault();

      if (filePath) {
        userWantedToOpen = filePath;
        dialog.showMessageBox({ message: '345' + filePath, buttons: ['OK'] });
      } else if (process.argv.length >= 2) {
        dialog.showMessageBox({ message: '456' + process.argv[1], buttons: ['OK'] });
        userWantedToOpen = process.argv[1];
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
    if (process.platform !== 'darwin') {
      app.quit();
    }
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

const dialog = require('electron').dialog;
const ipc = require('electron').ipcMain;
const shell = require('electron').shell;

const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
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

let selectedSourceFolder = '';  // later = ''
let selectedOutputFolder = ''; // later = ''

let theOriginalOpenFileDialogEvent;

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
    fs.statSync(pathToAppData + '/video-hub-app');
  } catch (e) {
    fs.mkdirSync(pathToAppData + '/video-hub-app');
  }

  // TODO -- catch bug if user closes before selecting the output folder
  fs.writeFile(pathToAppData + '/video-hub-app' + '/settings.json', json, 'utf8', () => {
    console.log('settings file written:');
    BrowserWindow.getFocusedWindow().close();
  });

});

/**
 * Just started -- hello -- send over the settings
 */
ipc.on('just-started', function (event, someMessage) {
  const pathToAppData = app.getPath('appData')
  console.log('app just started');
  fs.readFile(pathToAppData + '/video-hub-app' + '/settings.json', (err, data) => {
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
      totalNumberOfFiles = 0;
      walkAndCountSync(selectedSourceFolder, []);
      console.log(totalNumberOfFiles);
      event.sender.send('inputFolderChosen', selectedSourceFolder, totalNumberOfFiles);
    }
  })
})

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

      // create "/boris" inside the output directory it so that there is no `EEXIST` error when extracting.
      if (!fs.existsSync(selectedOutputFolder + '/boris')) {
        console.log('boris folder did not exist, creating');
        fs.mkdirSync(selectedOutputFolder + '/boris');
      }

      // store the reference to the Angular app
      theOriginalOpenFileDialogEvent = event;

      event.sender.send('outputFolderChosen', selectedOutputFolder);
    }
  })
})

/**
 * Start extracting the screenshots into a chosen output folder from a chosen input folder
 */
ipc.on('start-the-import', function (event, ssSize) {
  screenShotSize = ssSize;
  theExtractor('freshStart');
})

/**
 * Initiate rescan of the directory
 */
ipc.on('rescan-current-directory', function (event, inputAndOutput) {
  theOriginalOpenFileDialogEvent = event;
  reScanDirectory(inputAndOutput.inputFolder, inputAndOutput.outputFolder);
})

/**
 * Summon system modal to choose the images.vha file
 * send images object to App
 * send settings object to App
 */
ipc.on('load-the-file', function (event, somethingElse) {
  // console.log(somethingElse);

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
        // TODO: check if file ends in .vha before parsing !!!
        selectedOutputFolder = files[0].replace('\images.vha', '');

        fs.readFile(selectedOutputFolder + '/images.vha', (err, data) => {
          if (err) {
            throw err; // later maybe only log it ???
          } else {
            event.sender.send('finalObjectReturning', JSON.parse(data));
          }
        });
      }
    })

})

/**
 * Import this .vha file
 */
ipc.on('load-this-vha-file', function (event, pathToVhaFile) {
  console.log('the app is auto loading this vha file: ' + pathToVhaFile);

  // !!!!!!!!!!!!!!!! TODO !!!!!!!!!!!!!!!!!!
  // REMOVE IF DOES NOT WORK !!!!!!!!!!!!!!!!
  if (userWantedToOpen) {
    pathToVhaFile = userWantedToOpen;
  }

  fs.readFile(pathToVhaFile, (err, data) => {
    if (err) {
      throw err; // later maybe only log it ???
    } else {
      event.sender.send('finalObjectReturning', JSON.parse(data));
    }
  });

})

/**
 * Open a particular video file clicked inside Angular
 */
ipc.on('openThisFile', function (event, fullFilePath) {
  shell.openItem(fullFilePath);
})

// ============================================================
// Methods to extract screenshots, build file list, etc
// ============================================================

/**
 * Sends progress to Angular App
 * @param current number
 * @param total unmber
 */
function sendCurrentProgress(current: number, total: number): void {
  theOriginalOpenFileDialogEvent.sender.send('processingProgress', current, total);
}

/**
 * Writes the json file and sends contents back to Angular App
 */
function sendFinalResultHome(): void {

  alphabetizeFinalArray();

  const finalObject: FinalObject = {
    ssSize: screenShotSize,
    numOfFolders: countFoldersInFinalArray(),
    inputDir: selectedSourceFolder,
    outputDir: selectedOutputFolder,
    lastScreen: MainCounter.screenShotFileNumber, // REPRESENTS NEXT AVAILABLE NUMBER FOR THE TAKING
    images: finalArray
  };

  const json = JSON.stringify(finalObject);
  // write the file
  fs.writeFile(selectedOutputFolder + '/images.vha', json, 'utf8', () => {
    console.log('file written:');
    theOriginalOpenFileDialogEvent.sender.send('finalObjectReturning', JSON.parse(json));
  });
}

import { MainCounter } from './main-counter';

type ExtractorMessage = 'screenShotExtracted'
                      | 'metaExtracted'
                      | 'screenShotError'
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

  } else if (message === 'screenShotError') {
    MainCounter.itemInFinalArray++;
    areWeDoneYet();

  } else if (message === 'metaError') {
    console.log('meta error !!!!!!!!!!!!!!!!!!!!!!! --- THIS SHOULD NOT HAPPEN !!!!!!!!!!!!!!!!');
    MainCounter.itemInFinalArray++;
    areWeDoneYet();

  } else if (message === 'freshStart') {
    // reset things and launch extraction of first screenshot !!!
    finalArray = [];
    fileCounter = 0;
    MainCounter.totalNumber = 0;
    MainCounter.itemInFinalArray = 0;
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
  sendCurrentProgress(MainCounter.itemInFinalArray, MainCounter.totalNumber);
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
  const index = MainCounter.itemInFinalArray;
  takeScreenshots(path.join(selectedSourceFolder,
                            finalArray[index][0],
                            finalArray[index][1]));
}

let screenShotSize = 100;
const count = 10;
const timestamps = ['5%', '15%', '25%', '35%', '45%', '55%', '65%', '75%', '85%', '95%'];
let i = 0;
/**
 * Takes 10 screenshots for a particular file
 * calls theExtractor when done
 *  @param file Full path to file including file name
 */
function takeScreenshots(file) {
  ffmpeg(file)
    .screenshots({
      count: 1,
      timemarks: [timestamps[i]],
      filename: MainCounter.screenShotFileNumber + `-${i + 1}.jpg`,
      size: '?x' + screenShotSize
    }, path.join(selectedOutputFolder, 'boris'))
    .on('end', () => {
      i = i + 1;
      if (i < count) {
        takeScreenshots(file);
      } else if (i === count) {
        i = 0;
        // store the screenshot number (e.g. 42 from 42-0.jpg)
        finalArray[MainCounter.itemInFinalArray][3] = MainCounter.screenShotFileNumber;
        theExtractor('screenShotExtracted');
      }
    })
    .on('error', () => {
      console.log('screenshot error occurred in file #' + file);
      theExtractor('screenShotError');
    });
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
      theExtractor('metaExtracted');
    }
  });
}

/**
 * Rescan the directory -- updating files etc -- SUPER COMPLICATED
 */
function reScanDirectory(inputFolder: string, outputFolder: string): void {

  console.log('inputFolder: ' + inputFolder);
  console.log('outputFolder: ' + outputFolder);

  fs.readFile(outputFolder + '/images.vha', (err, data) => {
    if (err) {
      console.log(err); // TODO: better error handling
    } else {
      console.log('images.vha file has been read: ----------------------------');
      const currentJson: FinalObject = JSON.parse(data);

      const oldFileList: any[] = currentJson.images;
      MainCounter.screenShotFileNumber = currentJson.lastScreen;
      selectedOutputFolder = currentJson.outputDir;
      selectedSourceFolder = currentJson.inputDir;
      screenShotSize = currentJson.ssSize;

      fileCounter = 0; // just in case
      walkSync(inputFolder, []); // this method updates the `finalArray`
      findTheDiff(oldFileList, inputFolder);
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
    extractNextScreenshot();
  } else {
    sendFinalResultHome();
  }

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
    if (finalArrayFolderMap.has(element[0])) {
      // do nothing
    } else {
      finalArrayFolderMap.set(element[0], 1);
    }
  });
  return finalArrayFolderMap.size;
}

// ---------------------- FOLDER WALKER FUNCTION --------------------------------

const acceptableFiles = ['mp4', 'mpg', 'mpeg', 'mov', 'm4v', 'avi'];
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

  files.forEach(function (file) {
    // if the item is a _DIRECTORY_
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkAndCountSync(path.join(dir, file), filelist);
    } else {
      const extension = file.split('.').pop();
      if (acceptableFiles.includes(extension)) {
        totalNumberOfFiles++;
      }
    }
  });

  return filelist;
};

