import { app, BrowserWindow, screen } from 'electron';
import * as path from 'path';
import * as url from 'url';

// ========================================================================================
// ***************************** BUILD TOGGLE *********************************************
// ========================================================================================
const demo = false;
// ========================================================================================


process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

// MY IMPORTANT IMPORT !!!!
const dialog = require('electron').dialog;

let userWantedToOpen = null;
let myWindow = null;

// TODO -- maybe clean up the `userWantedToOpen` with whatever pattern recommended by Electron
// For windows -- when loading the app the first time
if (process.argv[1]) {
  if (!serve) {
    userWantedToOpen = process.argv[1];
  }
}

// OPEN FILE ON WINDOWS FROM FILE DOUBLE CLICK
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {

  app.on('second-instance', (event, argv: string[], workingDirectory) => {

    // dialog.showMessageBox({
    //   message: 'second-instance: \n' + argv[0] + ' \n' + argv[1],
    //   buttons: ['OK']
    // });

    if (argv[1]) {
      userWantedToOpen = argv[1];
      openThisDamnFile(argv[1]);
    }

    // Someone tried to run a second instance, we should focus our window.
    if (myWindow) {
      if (myWindow.isMinimized()) {
        myWindow.restore();
      }
      myWindow.focus();
    }
  });
}

let screenWidth;
let screenHeight;

function createWindow() {
  const desktopSize = screen.getPrimaryDisplay().workAreaSize;

  screenWidth = desktopSize.width;
  screenHeight = desktopSize.height;

  // Create the browser window.
  win = new BrowserWindow({
    webPreferences: {
      webSecurity: false  // allow files from hard disk to show up
    },
    x: screenWidth / 2 - 210,
    y: screenHeight / 2 - 125,
    width: 420,
    height: 250,
    center: true,
    minWidth: 420,
    minHeight: 250,
    icon: path.join(__dirname, 'src/assets/icons/png/64x64.png'),
    frame: false  // removes the frame from the window completely
  });

  myWindow = win;

  // Open the DevTools.
  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
    win.webContents.openDevTools();
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
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

// ============================================================
// My variables
// ============================================================

import {
  alphabetizeFinalArray,
  countFoldersInFinalArray,
  extractAllMetadata,
  getVideoPathsAndNames,
  missingThumbsIndex,
  sendCurrentProgress,
  generateScreenshotStrip,
  updateFinalArrayWithHD,
  writeVhaFileToDisk,
  findAndImportNewFiles
} from './main-support';

import { FinalObject, ImageElement } from './src/app/components/common/final-object.interface';
import { ImportSettingsObject } from './src/app/components/common/import.interface';
import { SavableProperties } from './src/app/components/common/savable-properties.interface';
import { SettingsObject } from './src/app/components/common/settings-object.interface';

import { globals } from './main-globals';

let lastSavedFinalObject: FinalObject; // hack for saving the `vha` file again later

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
        message: 'No such file found:',
        detail: pathToVhaFile,
        buttons: ['OK']
      });
      globals.angularApp.sender.send('pleaseOpenWizard');
    } else {
      globals.currentlyOpenVhaFile = pathToVhaFile;
      lastSavedFinalObject = JSON.parse(data);

      // path to folder where the VHA file is
      globals.selectedOutputFolder = path.parse(pathToVhaFile).dir;

      // use relative paths
      if (lastSavedFinalObject.inputDir === '') {
        lastSavedFinalObject.inputDir = globals.selectedOutputFolder;
      }

      let changedRootFolder = false;
      // check root folder exists
      if (!fs.existsSync(lastSavedFinalObject.inputDir)) {
        // see if the user wants to change the root folder
        const result = dialog.showMessageBox({
          message: 'Video folder not found:',
          detail: lastSavedFinalObject.inputDir,
          buttons: ['Select Root Folder', 'Continue Anyway', 'Cancel']
        });
        if (result === 0) {
          // select the new root folder
          const files = dialog.showOpenDialog({
            properties: ['openDirectory']
          });
          if (files) {
            // update the root folder
            const inputDirPath: string = files[0];
            lastSavedFinalObject.inputDir = inputDirPath;
            changedRootFolder = true;
          } else {
            // show the wizard instead
            lastSavedFinalObject = null;
            globals.angularApp.sender.send('pleaseOpenWizard');
            return;
          }
        } else if (result === 2) {
          // show the wizard instead
          lastSavedFinalObject = null;
          globals.angularApp.sender.send('pleaseOpenWizard');
          return;
        }
      }

      setGlobalsFromVhaFile(lastSavedFinalObject); // sets source folder ETC

      console.log(globals.selectedSourceFolder + ' - videos location');
      console.log(globals.selectedOutputFolder + ' - output location');

      // TODO: Make this a setting toggle :)
      // // resume extracting any missing thumbnails
      // const screenshotOutputFolder: string = path.join(globals.selectedOutputFolder, 'vha-' + globals.hubName);
      //
      // const indexesToScan: number[] = missingThumbsIndex(lastSavedFinalObject.images, screenshotOutputFolder);
      //
      // extractAllScreenshots(
      //   lastSavedFinalObject.images,
      //   globals.selectedSourceFolder,
      //   screenshotOutputFolder,
      //   globals.screenShotHeight,
      //   indexesToScan
      // );

      globals.angularApp.sender.send(
        'finalObjectReturning',
        lastSavedFinalObject,
        pathToVhaFile,
        globals.selectedOutputFolder + path.sep,   // app needs the trailing slash (at least for now)
        changedRootFolder
      );
    }
  });
}

function setGlobalsFromVhaFile(vhaFileContents: FinalObject) {
  globals.hubName = vhaFileContents.hubName,
  globals.screenShotHeight = vhaFileContents.screenshotHeight;
  globals.selectedSourceFolder = vhaFileContents.inputDir;
}

// ============================================================
// Methods that interact with Angular
// ============================================================

/**
 * Just started -- hello -- send over the settings or open wizard
 */
ipc.on('just-started', function (event, someMessage) {
  globals.angularApp = event;
  globals.winRef = win;

  fs.readFile(path.join(pathToAppData, 'video-hub-app', 'settings.json'), (err, data) => {
    if (err) {
      event.sender.send('pleaseOpenWizard', true); // firstRun = true!
    } else {

      const savedSettings = JSON.parse(data);

      // Restore last windows size and position or full screen if not available
      if (savedSettings.windowSizeAndPosition
        && savedSettings.windowSizeAndPosition.x < screenWidth - 200
        && savedSettings.windowSizeAndPosition.y < screenHeight - 200) {
          win.setBounds(savedSettings.windowSizeAndPosition);
      } else {
        win.setBounds({ x: 0, y: 0, width: screenWidth, height: screenHeight });
      }

      event.sender.send('settingsReturning', savedSettings, userWantedToOpen);
    }
  });
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
ipc.on('pleaseOpenUrl', function(event, urlToOpen: string): void {
  shell.openExternal(urlToOpen, { activate: true }, (): void => {});
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
      event.sender.send('inputFolderChosen', inputDirPath, getVideoPathsAndNames(inputDirPath));
    }
  });
});

/**
 * Summon system modal to choose OUTPUT directory
 * where the final .vha file, vha-folder, and all screenshots will be saved
 */
ipc.on('choose-output', function (event, someMessage) {
  dialog.showOpenDialog({
    properties: ['openDirectory']
  }, function (files) {
    if (files) {
      const outputDirPath = files[0];
      event.sender.send('outputFolderChosen', outputDirPath);
    }
  });
});

/**
 * Initiate scanning for new files and importing them
 * now receives the finalArray from `home.component`
 * because the user may have renamed files from within the app!
 */
ipc.on('import-new-files', function (event, currentAngularFinalArray: ImageElement[]) {
  const currentVideoFolder = globals.selectedSourceFolder;
  globals.cancelCurrentImport = false;
  scanForNewFiles(currentAngularFinalArray, currentVideoFolder);
});

/**
 * Initiate verifying all files have thumbnails
 */
ipc.on('verify-thumbnails', function (event) {
  const currentVideoFolder = globals.selectedSourceFolder;
  globals.cancelCurrentImport = false;
  verifyThumbnails();
});

/**
 * Initiate rescan of the directory NEW
 * now receives the finalArray from `home.component`
 * because the user may have renamed files from within the app!
 */
ipc.on('rescan-current-directory', function (event, currentAngularFinalArray: ImageElement[]) {
  const currentVideoFolder = globals.selectedSourceFolder;
  globals.cancelCurrentImport = false;
  reScanDirectory(currentAngularFinalArray, currentVideoFolder);
});

const pathToAppData = app.getPath('appData');

/**
 * Close the window
 */
ipc.on('close-window', function (event, settingsToSave: SettingsObject, savableProperties: SavableProperties) {

  // save window size and position
  settingsToSave.windowSizeAndPosition = win.getBounds();

  const json = JSON.stringify(settingsToSave);

  try {
    fs.statSync(path.join(pathToAppData, 'video-hub-app'));
  } catch (e) {
    fs.mkdirSync(path.join(pathToAppData, 'video-hub-app'));
  }

  // TODO -- catch bug if user closes before selecting the output folder ?!??
  fs.writeFile(path.join(pathToAppData, 'video-hub-app', 'settings.json'), json, 'utf8', () => {
    if (savableProperties !== null) {
      lastSavedFinalObject.addTags = savableProperties.addTags;
      lastSavedFinalObject.removeTags = savableProperties.removeTags;
      lastSavedFinalObject.images = savableProperties.images;
      writeVhaFileToDisk(lastSavedFinalObject, globals.currentlyOpenVhaFile, () => {
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
 * Interrupt current import process
 */
ipc.on('cancel-current-import', function(event): void {
  globals.cancelCurrentImport = true;
});

/**
 * Start extracting the screenshots into a chosen output folder from a chosen input folder
 */
ipc.on('start-the-import', function (event, options: ImportSettingsObject, videoFilesWithPaths: ImageElement[]) {

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

    globals.cancelCurrentImport = false;
    globals.hubName = options.hubName;
    globals.numberOfScreenshots = options.numberOfScreenshots;
    globals.screenShotHeight = options.imgHeight;
    globals.selectedOutputFolder = options.exportFolderPath;
    globals.selectedSourceFolder = options.videoDirPath;

    if (demo) {
      videoFilesWithPaths = videoFilesWithPaths.slice(0, 50);
    }

    extractAllMetadata(
      videoFilesWithPaths,
      globals.selectedSourceFolder,
      globals.numberOfScreenshots,
      0,
      sendFinalResultHome         // callback for when metdata is done extracting
    );

  }

});

/**
 * Begin scanning for new files and importing them
 *
 * @param angularFinalArray  ImageElment[] from Angular (might have renamed files)
 */
function scanForNewFiles(angularFinalArray: ImageElement[], currentVideoFolder: string) {

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
      globals.numberOfScreenshots,
      sendFinalResultHome           // callback for when `extractAllMetadata` is called
    );

  } else {
    sendCurrentProgress(1, 1, 0);
    dialog.showMessageBox({
      message: 'Directory ' + currentVideoFolder + ' does not exist',
      buttons: ['OK']
    });
  }
}

/**
 * Scan for missing thumbnails and generate them
 */
function verifyThumbnails() {
  // resume extracting any missing thumbnails
  const screenshotOutputFolder: string = path.join(globals.selectedOutputFolder, 'vha-' + globals.hubName);

  const indexesToScan: number[] = missingThumbsIndex(lastSavedFinalObject.images, screenshotOutputFolder);

  extractAllScreenshots(
    lastSavedFinalObject.images,
    globals.selectedSourceFolder,
    screenshotOutputFolder,
    globals.screenShotHeight,
    indexesToScan
  );
}

/**
 * Begins rescan procedure compared to what the app has currently
 *
 * @param angularFinalArray  ImageElment[] from Angular (might have renamed files)
 */
function reScanDirectory(angularFinalArray: ImageElement[], currentVideoFolder: string) {

  // rescan the source directory
  if (fs.existsSync(currentVideoFolder)) {
    let videosOnHD: ImageElement[] = getVideoPathsAndNames(currentVideoFolder);

    if (demo) {
      videosOnHD = videosOnHD.slice(0, 50);
    }

    const folderToDeleteFrom = path.join(globals.selectedOutputFolder, 'vha-' + globals.hubName);

    updateFinalArrayWithHD(
      angularFinalArray,
      videosOnHD,
      currentVideoFolder,
      globals.numberOfScreenshots,
      folderToDeleteFrom,
      sendFinalResultHome           // callback for when `extractAllMetadata` is called
    );

  } else {
    sendCurrentProgress(1, 1, 0);
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
        // TODO: maybe check if file ends in .vha before parsing !?!!
        // TODO: fix up this stupid pattern of overriding method with variable !!!
        userWantedToOpen = files[0];
        openThisDamnFile(files[0]);
      }
    });
});

/**
 * Import this .vha file
 */
ipc.on('load-this-vha-file', function (event, pathToVhaFile: string, savableProperties: SavableProperties) {

  if (savableProperties !== null) {
    lastSavedFinalObject.addTags = savableProperties.addTags;
    lastSavedFinalObject.removeTags = savableProperties.removeTags;
    lastSavedFinalObject.images = savableProperties.images;
    writeVhaFileToDisk(lastSavedFinalObject, globals.currentlyOpenVhaFile, () => {
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

ipc.on('try-to-rename-this-file', function(event, sourceFolder: string, relPath: string, file: string, renameTo: string): void {
  console.log('renaming file:');

  const original: string = path.join(sourceFolder, relPath, file);
  const newName: string = path.join(sourceFolder, relPath, renameTo);

  console.log(original);
  console.log(newName);

  let success = true;
  let errMsg: string;

  // check if already exists first
  if (fs.existsSync(newName)) {
    console.log('some file already EXISTS WITH THAT NAME !!!');
    success = false;
    errMsg = 'RIGHCLICK.errorFileNameExists';
  } else {
    try {
      fs.renameSync(original, newName);
    } catch (err) {
      success = false;
      console.log(err);
      if (err.code === 'ENOENT') {
        // const pathObj = path.parse(err.path);
        // console.log(pathObj);
        errMsg = 'RIGHTCLICK.errorFileNotFound';
      } else {
        errMsg = 'RIGHTCLICK.errorSomeError';
      }
    }
  }

  globals.angularApp.sender.send('renameFileResponse', success, errMsg);
});

// ============================================================
// Methods to extract screenshots, build file list, etc
// ============================================================

/**
 * Writes the vha file and sends contents back to Angular App
 * Starts the process to extract all the images
 * @param theFinalArray -- `finalArray` with all the metadata filled in
 */
function sendFinalResultHome(
  theFinalArray: ImageElement[]
): void {

  const myFinalArray: ImageElement[] = alphabetizeFinalArray(theFinalArray);

  const finalObject: FinalObject = {
    hubName: globals.hubName,
    inputDir: globals.selectedSourceFolder,
    numOfFolders: countFoldersInFinalArray(myFinalArray),
    numberOfScreenshots: globals.numberOfScreenshots,
    screenshotHeight: globals.screenShotHeight,
    images: myFinalArray,
  };

  lastSavedFinalObject = finalObject;

  const pathToTheFile = path.join(globals.selectedOutputFolder, globals.hubName + '.vha');

  writeVhaFileToDisk(finalObject, pathToTheFile, () => {

    globals.currentlyOpenVhaFile = pathToTheFile;

    globals.angularApp.sender.send(
      'finalObjectReturning',
      finalObject,
      pathToTheFile,
      globals.selectedOutputFolder + path.sep // app needs the trailing slash (at least for now)
    );

    const screenshotOutputFolder: string = path.join(globals.selectedOutputFolder, 'vha-' + globals.hubName);

    const indexesToScan: number[] = missingThumbsIndex(myFinalArray, screenshotOutputFolder);

    extractAllScreenshots(
      myFinalArray,
      globals.selectedSourceFolder,
      screenshotOutputFolder,
      globals.screenShotHeight,
      indexesToScan
    );

  });
}

// DANGEROUSLY DEPENDS ON a global variable `globals.cancelCurrentImport`
// that can get toggled while scanning all screenshots

/**
 * Start extracting screenshots now that metadata has been retreived and sent over to the app
 * @param theFinalArray     -- finalArray of ImageElements
 * @param videoFolderPath   -- path to base folder where videos are
 * @param screenshotFolder  -- path to folder where .jpg files will be saved
 * @param screenshotHeight    -- number in px how large each screenshot should be
 * @param elementsToScan    -- array of indexes of elements in finalArray for which to extract screenshots
 */
function extractAllScreenshots(
  theFinalArray: ImageElement[],
  videoFolderPath: string,
  screenshotFolder: string,
  screenshotHeight: number,
  elementsToScan: number[]
): void {

  // final array already saved at this point - nothing to update inside it
  // just walk through `elementsToScan` to extract screenshots for elements in `theFinalArray`
  const itemTotal = elementsToScan.length;
  let iterator = -1; // gets incremented to 0 on first call

  const extractTenCallback = (): void => {
    iterator++;

    if ((iterator < itemTotal) && !globals.cancelCurrentImport) {

      sendCurrentProgress(iterator, itemTotal, 2);

      const currentElement = elementsToScan[iterator];

      const pathToVideo: string = (path.join(videoFolderPath,
                                             theFinalArray[currentElement].partialPath,
                                             theFinalArray[currentElement].fileName));

      const duration: number = theFinalArray[currentElement].duration;
      const fileHash: string = theFinalArray[currentElement].hash;
      const numOfScreenshots = theFinalArray[currentElement].numOfScreenshots;

      generateScreenshotStrip(
        pathToVideo,
        fileHash,
        duration,
        screenshotHeight,
        numOfScreenshots,
        screenshotFolder,
        extractTenCallback
      );
    } else {
      sendCurrentProgress(1, 1, 2); // indicates 100%
    }
  };

  extractTenCallback();
}
