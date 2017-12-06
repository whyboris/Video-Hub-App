import { app, BrowserWindow, screen } from 'electron';
import * as path from 'path';

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

if (serve) {
  require('electron-reload')(__dirname, {
  });
}

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

try {

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

import { FinalObject } from './src/app/components/common/final-object.interface';

let finalArray = [];
let fileCounter = 0;

let totalNumberOfFiles = 0;
let filesProcessed = 1;

let selectedSourceFolder = '';  // later = ''
let selectedOutputFolder = ''; // later = ''

let theOriginalOpenFileDialogEvent;

let fileNumberTracker = 0;

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

  // TODO -- catch bug if user closes before selecting the output folder
  fs.writeFile(selectedOutputFolder + '/settings.json', json, 'utf8', () => {
    console.log('settings file written:');
    //BrowserWindow.getFocusedWindow().close();
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

      event.sender.send('inputFolderChosen', selectedSourceFolder);
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
ipc.on('start-the-import', function (event, someMessage) {
  // console.log(someMessage);
  finalArray = [];
  fileCounter = 0;

  // reset number of files if user re-runs extraction a second time !!!
  totalNumberOfFiles = 0;

  // no need to return anything, walkSync updates `finalArray`
  // second param is needed for its own recursion
  walkSync(selectedSourceFolder, []);

  // reset files Processed
  filesProcessed = 1;

  totalNumberOfFiles = finalArray.length;
  console.log('there are a total of: ' + totalNumberOfFiles + ' files');
  if (totalNumberOfFiles > 0) {
    extractNextScreenshot();
  } else {
    // TODO: handle case when number of screenshots is zero!
    console.error('NO VIDEO FILES IN THIS DIRECTORY!');
  }

})

/**
 * Summon system modal to choose the images.json file
 * send images object to App
 * send settings object to App
 */
ipc.on('load-the-file', function (event, somethingElse) {
  // console.log(somethingElse);

  dialog.showOpenDialog({
      properties: ['openFile']
    }, function (files) {
      if (files) {
        console.log('the user has chosen this previously-saved json file: ' + files[0]);
        // TODO: check if file ends in .json before parsing !!!
        selectedOutputFolder = files[0].replace('\images.json', '');

        fs.readFile(selectedOutputFolder + '/images.json', (err, data) => {
          if (err) {
            throw err;
          }
          event.sender.send('finalObjectReturning', JSON.parse(data));
        });

        fs.readFile(selectedOutputFolder + '/settings.json', (err, data) => {
          if (err) {
            throw err;
          }
          event.sender.send('settingsReturning', JSON.parse(data));
        });
      }
    })

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
 * Extract the next screenshot
 */
function extractNextScreenshot() {
  const index = fileNumberTracker;
  // extractScreenshot(path.join(selectedSourceFolder, finalArray[index][0], finalArray[index][1]), index); // OLD NEVER USE AGAIN
  takeScreenshots(path.join(selectedSourceFolder, finalArray[index][0], finalArray[index][1]), index);
  fileNumberTracker++
}

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
function sendFinalResultHome() {

  const finalObject: FinalObject = {
    inputDir: selectedSourceFolder,
    outputDir: selectedOutputFolder,
    lastScreen: totalNumberOfFiles,
    images: finalArray
  };

  const json = JSON.stringify(finalObject);
  // write the file
  fs.writeFile(selectedOutputFolder + '/images.json', json, 'utf8', () => {
    console.log('file written:');
    theOriginalOpenFileDialogEvent.sender.send('finalObjectReturning', JSON.parse(json));
  });
}

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
      // if file type is .mp4, .mpg, mpeg, .m4v, or .avi
      if (file.toLowerCase().indexOf('.mp4') !== -1
        || file.toLowerCase().indexOf('.avi') !== -1
        || file.toLowerCase().indexOf('.mpg') !== -1
        || file.toLowerCase().indexOf('.mpeg') !== -1
        || file.toLowerCase().indexOf('.mkv') !== -1
        || file.toLowerCase().indexOf('.m4v') !== -1) {
          // before adding, remove the redundant prefix: selectedSourceFolder
          const partialPath = dir.replace(selectedSourceFolder, '');

          const cleanFileName = cleanUpFileName(file);

          finalArray[fileCounter] = [partialPath, file, cleanFileName];
          fileCounter++;
      }
    }
  });

  return filelist;
};

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

  result = result.split('_').join(' ');               // (1)
  result = result.split('.').slice(0, -1).join('.');  // (3)
  result = result.split('.').join(' ');               // (4)

  result = result.split('   ').join(' ');              // (2)
  result = result.split('  ').join(' ');               // (2)

  return result;
}

// ============================================================
// MISC
// ============================================================


// from https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/issues/449#issuecomment-285759269

// create an array that says ['5%', '15%', '25%', '35%', '45%', '55%', '65%', '75%', '85%', '95%']
const count = 10;
const timestamps = [];
const startPositionPercent = 5;
const endPositionPercent = 95;
const addPercent = (endPositionPercent - startPositionPercent) / (count - 1);
if (!timestamps.length) {
  let t = 0;
  while (t < count) {
    timestamps.push(`${startPositionPercent + addPercent * t}%`);
    t = t + 1;
  }
}
// all of above can be replaced with a simple array

let i = 0;
function takeScreenshots(file, currentFile) {
  ffmpeg(file)
    .on('end', () => {
      i = i + 1;

      if (i < count) {
        takeScreenshots(file, currentFile);
      }

      if (i === count) {
        // console.log('extracted #' + currentFile);
        // reset i and start with the next file here !!!
        i = 0;

        // store the screenshot number (e.g. 42 in 42-0.jpg)
        finalArray[currentFile][3] = currentFile;

        filesProcessed++;

        if (filesProcessed === totalNumberOfFiles + 1) {

          // if all files processed, start extracting metadata !!!
          filesProcessed = 1;
          extractNextMetadata();

        } else {
          sendCurrentProgress(filesProcessed, totalNumberOfFiles);
          extractNextScreenshot();
        }
      }
    })
    .screenshots({
      count: 1,
      timemarks: [timestamps[i]],
      filename: currentFile + `-${i + 1}.jpg`,
      size: '?x100'       // can be 200px -- should be option when importing later
    }, path.join(selectedOutputFolder, 'boris'));
}

let metaDataIndex = 0;

/**
 * Extract the next file's metadata
 */
function extractNextMetadata() {
  const index = metaDataIndex;
  extractMetadata(path.join(selectedSourceFolder, finalArray[index][0], finalArray[index][1]), index);
  metaDataIndex++
}

/**
 * Extract the meta data
 * @param filePath
 * @param currentFile
 */
function extractMetadata(filePath: string, currentFile: number): void {
  // console.log('extracting metadata from ' + filePath);
  const theFile = filePath;

  ffmpeg.ffprobe(theFile, (err, metadata) => {
    if (err) {
      console.log(err);
    }

    // console.log('duration of clip #' + currentFile + ': ');
    finalArray[currentFile][4] = Math.round(metadata.streams[0].duration); // 4th item is duration

    const origWidth = metadata.streams[0].width;
    const origHeight = metadata.streams[0].height;

    if (origWidth && origHeight) {
      finalArray[currentFile][5] = labelVideo(origWidth, origHeight);        // 5th item is the label, e.g. 'HD'
      finalArray[currentFile][6] = Math.round(100 * origWidth / origHeight); // 6th item is width of screenshot (130) for ex
    } else {
      finalArray[currentFile][5] = '';
      finalArray[currentFile][6] = 169;
    }

    // console.log('processed ' + filesProcessed + ' out of ' + totalNumberOfFiles);

    filesProcessed++;

    if (filesProcessed === totalNumberOfFiles + 1) {
      sendFinalResultHome();
    } else {
      extractNextMetadata();
    }

  });
}

/**
 * Label the video according to these rules
 * @param width
 * @param height
 */
function labelVideo(width: number, height: number): string {
  let size = '';

  if (width === 1280 && height === 720) {
    size = '720'; // 5th item is size (720, 1080, etc)
  } else if (width === 1920 && height === 1080) {
    size = '1080'; // 5th item is size (720, 1080, etc)
  } else if (width > 720) {
    size = 'HD'; // 5th item is size (720, 1080, etc)
  }
//  else if (width < 720)
//  size = 'SD'; // 5th item is size (720, 1080, etc)

  return size;
}



function reScanDirectory(sourceFolder: string, fullFilePath: string) {

  // 1 use regular file walking to scan full directory and create main file _WITHOUT SCREENSHOTS_

  // 2 open the regular file

  // 3 for each full directory, check if there is corresponding in regular file

    // (a) if there is, copy over and you're done
    // (b) if there is not, scan the screenshot

  // 1 opens the fullFilePath file
  // 2 parses it as json
  // 3 independently scans sourceFolder
  // 4 tries to reconcile things ...

}
