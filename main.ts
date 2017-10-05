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
    width: size.width,
    height: size.height
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

let finalArray = [];
let fileCounter = 0;

const selectedSourceFolder = '/Users/byakubchik/Desktop/VideoHub/input';  // later = ''
const selectedOutputFolder = '/Users/byakubchik/Desktop/VideoHub/output'; // later = ''

// ============================================================
// Functions
// ============================================================

ipc.on('openThisFile', function (event, fullFilePath) {
  shell.openItem(fullFilePath);
})

ipc.on('open-file-dialog', function (event, theDirectory) {
  console.log(theDirectory);
  finalArray = [];
  fileCounter = 0;
  walkSync(selectedSourceFolder, []);
  console.log(finalArray);

  finalArray.forEach((element, index) => {
    console.log('forEach running:');
    console.log(element);
    console.log(index);
    extractScreenshot(element[0] + '/' + element[1], index);
  });

  setTimeout(() => {
    // format the json
    const json = JSON.stringify({
      inputDir: selectedSourceFolder,
      outputDir: selectedOutputFolder,
      images: finalArray
    });
    // write the file
    fs.writeFile(selectedOutputFolder + '/images.json', json, 'utf8', () => { console.log("file written") });
    // send it back
    event.sender.send('filesArrayReturning', JSON.parse(json));
  }, 2000);
})

ipc.on('load-the-file', function (event, somethingElse) {
  console.log(somethingElse);
  fs.readFile(selectedOutputFolder + '/images.json', (err, data) => {
    if (err) {
      throw err;
    }
    event.sender.send('filesArrayReturning', JSON.parse(data));
  });
})

// ============================================================
// Extracts screenshot
// ============================================================

const extractScreenshot = function (filePath, currentFile) {
  console.log('Extracting 3 screenshots');
  console.log('file:///' + filePath);
  const theFile = 'file:///' + filePath;

  ffmpeg(theFile)
    .on('filenames', function (filenames) {
      // console.log('Screenshots: ' + filenames.join(', '));
      finalArray[currentFile][2] = [];
      // prepend full path to each
      filenames.forEach((element, index) => {
        finalArray[currentFile][2][index] = selectedOutputFolder + '/boris/' + element;
      });
      console.log(finalArray[currentFile][2]);
    })
    .on('end', function () {
      console.log('Screenshots taken and finished');
    })
    .screenshots({
      // timestamps: ['25%', '50%', '75%'],
      timestamps: ['10%', '30%', '50%', '70%', '90%'],
      filename: 'thumb%s.png',
      folder: selectedOutputFolder + '/boris',
      size: '200x200'
    });
}

// ============================================================
// WALK FILE
// ============================================================

const walkSync = function(dir, filelist) {
  console.log('walk started');
  const files = fs.readdirSync(dir);
  // console.log(files);

  files.forEach(function (file) {
    // if the item is a _DIRECTORY_
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    } else {
      // filter out anything other than .mp4
      if (file.indexOf('.mp4') !== -1) {
        filelist.push(dir + '/' + file);
        finalArray[fileCounter] = [dir, file];
        fileCounter++;
      }
    }
  });

  return filelist;
};


// ============================================================
// MISC
// ============================================================

// ipc.on('open-file-dialog', function (event) {
//   dialog.showOpenDialog({
//     properties: ['openFile', 'openDirectory']
//   }, function (files) {
//     if (files) {
//       event.sender.send('selected-directory', files);
//     }
//   })
// })

