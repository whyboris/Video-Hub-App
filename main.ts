import { app, BrowserWindow, screen } from 'electron';
import * as path from 'path';
import * as url from 'url';

const { systemPreferences } = require('electron')

import { globals } from './main-globals';

const codeRunningOnMac: boolean = process.platform === 'darwin';

// ========================================================================================
// ***************************** BUILD TOGGLE *********************************************
// ========================================================================================
const demo = false;
globals.version = '1.9.9';
// ========================================================================================


process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');
globals.debug = args.some(val => val === '--debug');

if (globals.debug) {
  console.log('Debug mode enabled!');
}

// MY IMPORTANT IMPORT !!!!
const dialog = require('electron').dialog;

let userWantedToOpen: string = null;
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

  app.on('second-instance', (event, argv: string[], workingDirectory: string) => {

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
      nodeIntegration: true,
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
    app.on('open-file', (event, filePath: string) => {
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

if (codeRunningOnMac) {
  systemPreferences.subscribeNotification(
    'AppleInterfaceThemeChangedNotification',
    function theThemeHasChanged () {
      if (systemPreferences.isDarkMode()) {
        tellElectronDarkModeChange('dark');
      } else {
        tellElectronDarkModeChange('light');
      }
    }
  );
}

// ========================================================================================
// My imports
// ========================================================================================

const fs = require('fs');

const ipc = require('electron').ipcMain;
const shell = require('electron').shell;

// ========================================================================================
// My variables
// ========================================================================================

import {
  alphabetizeFinalArray,
  countFoldersInFinalArray,
  extractAllMetadata,
  getVideoPathsAndNames,
  insertTemporaryFields,
  missingThumbsIndex,
  sendCurrentProgress,
  writeVhaFileToDisk
} from './main-support';

import { extractFromTheseFiles } from './main-extract';

import { FinalObject, ImageElement } from './src/app/components/common/final-object.interface';
import { ImportSettingsObject } from './src/app/components/common/import.interface';
import { SavableProperties } from './src/app/components/common/savable-properties.interface';
import { SettingsObject } from './src/app/components/common/settings-object.interface';

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
      console.log('opened vha file version: ' + lastSavedFinalObject.version);

      // path to folder where the VHA file is
      globals.selectedOutputFolder = path.parse(pathToVhaFile).dir;

      // use relative paths
      if (lastSavedFinalObject.inputDir === '') {
        lastSavedFinalObject.inputDir = globals.selectedOutputFolder;
      }

      let changedRootFolder = false;
      let rootFolderLive = true;
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
        } else if (result === 1) {
          console.log('PROCEED ANYWAY');
          rootFolderLive = false;
        }
      }

      setGlobalsFromVhaFile(lastSavedFinalObject); // sets source folder ETC

      lastSavedFinalObject.images = insertTemporaryFields(lastSavedFinalObject.images);

      console.log(globals.selectedSourceFolder + ' - videos location');
      console.log(globals.selectedOutputFolder + ' - output location');

      // TODO: Make this a setting toggle :)
      // // resume extracting any missing thumbnails
      // const screenshotOutputFolder: string = path.join(globals.selectedOutputFolder, 'vha-' + globals.hubName);
      //
      // const indexesToScan: number[] = missingThumbsIndex(
      //   lastSavedFinalObject.images,
      //   screenshotOutputFolder
      //   globals.screenshotSettings.clipSnippets > 0
      // );
      //
      // extractFromTheseFiles(
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
        getHtmlPath(globals.selectedOutputFolder),
        changedRootFolder,
        rootFolderLive
      );
    }
  });
}

/**
 * Return an HTML string for a path to the `vha` file
 * e.g. `C:\Some folder` becomes `C:/Some%20folder`
 * @param anyOsPath
 */
function getHtmlPath(anyOsPath: string): string {
      // Windows was misbehaving
      // so we normalize the path (just in case) and replace all `\` with `/` in this instance
      // because at this point Electron will be showing images following the path provided
      // with the `file:///` protocol -- seems to work
      const normalizedPath: string = path.normalize(anyOsPath);
      const forwardSlashes: string = normalizedPath.replace(/\\/g, '/');
      return forwardSlashes.replace(/ /g, '%20');
}

/**
 * Update 3 globals:
 *  - hubName
 *  - screenshotSettings
 *  - selectedSourceFolder
 * @param vhaFileContents
 */
function setGlobalsFromVhaFile(vhaFileContents: FinalObject) {
  globals.hubName = vhaFileContents.hubName,
  globals.screenshotSettings = vhaFileContents.screenshotSettings;
  globals.selectedSourceFolder = vhaFileContents.inputDir;
}

// ========================================================================================
// Methods that interact with Angular
// ========================================================================================

const pathToAppData = app.getPath('appData');

/**
 * Just started -- hello -- send over the settings or open wizard
 */
ipc.on('just-started', function (event, someMessage) {
  globals.angularApp = event;
  globals.winRef = win;

  if (codeRunningOnMac) {
    tellElectronDarkModeChange(systemPreferences.getEffectiveAppearance());
  }

  fs.readFile(path.join(pathToAppData, 'video-hub-app-2', 'settings.json'), (err, data) => {
    if (err) {
      win.setBounds({ x: 0, y: 0, width: screenWidth, height: screenHeight });
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

      // Reference: https://github.com/electron/electron/blob/master/docs/api/locales.md
      const locale: string = app.getLocale();

      event.sender.send('settingsReturning', savedSettings, userWantedToOpen, locale);
    }
  });
});

/**
 * Open a particular video file clicked inside Angular
 */
ipc.on('openThisFile', function (event, fullFilePath) {
  shell.openItem(path.normalize(fullFilePath)); // normalize because on windows, the path sometimes is mixing `\` and `/`
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
  shell.openExternal(urlToOpen, { activate: true });
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
 * Close the window / quit / exit the app
 */
ipc.on('close-window', function (event, settingsToSave: SettingsObject, savableProperties: SavableProperties) {

  // save window size and position
  settingsToSave.windowSizeAndPosition = win.getBounds();

  const json = JSON.stringify(settingsToSave);

  try {
    fs.statSync(path.join(pathToAppData, 'video-hub-app-2'));
  } catch (e) {
    fs.mkdirSync(path.join(pathToAppData, 'video-hub-app-2'));
  }

  // TODO -- catch bug if user closes before selecting the output folder ?!??
  fs.writeFile(path.join(pathToAppData, 'video-hub-app-2', 'settings.json'), json, 'utf8', () => {
    if (savableProperties !== null) {
      lastSavedFinalObject.addTags = savableProperties.addTags;
      lastSavedFinalObject.removeTags = savableProperties.removeTags;
      lastSavedFinalObject.images = savableProperties.images;
      writeVhaFileToDisk(lastSavedFinalObject, globals.currentlyOpenVhaFile, () => {
        // file writing done !!!
        console.log('.vha2 file written before closing !!!');
        BrowserWindow.getFocusedWindow().close();
      });
    } else {
      BrowserWindow.getFocusedWindow().close();
    }
  });
});

/**
 * Notify front-end about OS change in Dark Mode setting
 * @param mode
 */
function tellElectronDarkModeChange(mode: string) {
  globals.angularApp.sender.send('osDarkModeChange', mode);
}

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
  if (fs.existsSync(path.join(outDir, options.hubName + '.vha2'))) {

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
      fs.mkdirSync(path.join(outDir, 'vha-' + options.hubName + '/filmstrips'));
      fs.mkdirSync(path.join(outDir, 'vha-' + options.hubName + '/thumbnails'));
      fs.mkdirSync(path.join(outDir, 'vha-' + options.hubName + '/clips'));
    }

    globals.cancelCurrentImport = false;
    globals.hubName = options.hubName;
    globals.selectedOutputFolder = options.exportFolderPath;
    globals.selectedSourceFolder = options.videoDirPath;

    // determine number of screenshots
    let numOfScreenshots: number = 0;
    if (options.screensPerVideo) {
      numOfScreenshots = options.ssConstant;
    } else {
      numOfScreenshots = options.ssVariable;
    }
    globals.screenshotSettings = {
      clipSnippetLength: options.clipSnippetLength,
      clipSnippets: options.clipSnippets,
      fixed: options.screensPerVideo,
      height: options.imgHeight,
      n: numOfScreenshots,
    };

    if (demo) {
      videoFilesWithPaths = videoFilesWithPaths.slice(0, 50);
    }

    extractAllMetadata(
      videoFilesWithPaths,
      globals.selectedSourceFolder,
      globals.screenshotSettings,
      0,
      sendFinalResultHome         // callback for when metdata is done extracting
    );

  }

});

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
        extensions: ['vha2']
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

// ========================================================================================
// Methods to extract screenshots, build file list, etc
// ========================================================================================

/**
 * Writes the vha file and sends contents back to Angular App
 * Starts the process to extract all the images
 *
 * METHOD NOT A PURE FUNCTION !!!
 * INTERACTS with `lastSavedFinalObject`
 *
 * @param theFinalArray -- `finalArray` with all the metadata filled in
 */
function sendFinalResultHome(theFinalArray: ImageElement[]): void {

  const myFinalArray: ImageElement[] = alphabetizeFinalArray(theFinalArray);

  const finalObject: FinalObject = {
    version: globals.vhaFileVersion,
    hubName: globals.hubName,
    inputDir: globals.selectedSourceFolder,
    numOfFolders: countFoldersInFinalArray(myFinalArray),
    screenshotSettings: globals.screenshotSettings,
    images: myFinalArray,
  };

  lastSavedFinalObject = finalObject;

  const pathToTheFile = path.join(globals.selectedOutputFolder, globals.hubName + '.vha2');

  writeVhaFileToDisk(finalObject, pathToTheFile, () => {

    globals.currentlyOpenVhaFile = pathToTheFile;

    finalObject.images = insertTemporaryFields(finalObject.images);

    globals.angularApp.sender.send(
      'finalObjectReturning',
      finalObject,
      pathToTheFile,
      globals.selectedOutputFolder + path.sep // app needs the trailing slash (at least for now) -- TODO check if needed still
      // changedRootFolder -- no need to initialize
      // rootFolderLive    -- no need to initialize
    );

    const screenshotOutputFolder: string = path.join(globals.selectedOutputFolder, 'vha-' + globals.hubName);

    const indexesToScan: number[] = missingThumbsIndex(
      myFinalArray,
      screenshotOutputFolder,
      globals.screenshotSettings.clipSnippets > 0 // convert number to appropriate boolean
    );

    extractFromTheseFiles(
      myFinalArray,
      globals.selectedSourceFolder,
      screenshotOutputFolder,
      globals.screenshotSettings.height,
      indexesToScan,
      globals.screenshotSettings.clipSnippets,
      globals.screenshotSettings.clipSnippetLength
    );

  });
}


// ===========================================================================================
// RESCAN - electron messages
// -------------------------------------------------------------------------------------------

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
 * Initiate rescan of the directory NEW
 * now receives the finalArray from `home.component`
 * because the user may have renamed files from within the app!
 */
ipc.on('rescan-current-directory', function (event, currentAngularFinalArray: ImageElement[]) {
  const currentVideoFolder = globals.selectedSourceFolder;
  globals.cancelCurrentImport = false;
  reScanDirectory(currentAngularFinalArray, currentVideoFolder);
});

/**
 * Initiate verifying all files have thumbnails
 */
ipc.on('verify-thumbnails', function (event) {
  globals.cancelCurrentImport = false;
  verifyThumbnails();
});

// ===========================================================================================
// RESCAN - methods
// -------------------------------------------------------------------------------------------

/**
 * Scan for missing thumbnails and generate them
 */
function verifyThumbnails() {
  // resume extracting any missing thumbnails
  const screenshotOutputFolder: string = path.join(globals.selectedOutputFolder, 'vha-' + globals.hubName);

  const indexesToScan: number[] = missingThumbsIndex(
    lastSavedFinalObject.images,
    screenshotOutputFolder,
    globals.screenshotSettings.clipSnippets > 0
  );

  extractFromTheseFiles(
    lastSavedFinalObject.images,
    globals.selectedSourceFolder,
    screenshotOutputFolder,
    globals.screenshotSettings.height,
    indexesToScan,
    globals.screenshotSettings.clipSnippets,
    globals.screenshotSettings.clipSnippetLength
  );
}

import {
  findAndImportNewFiles,
  regenerateLibrary,
  updateFinalArrayWithHD,
} from './main-rescan';

/**
 * Begins rescan procedure compared to what the app has currently
 *
 * @param angularFinalArray  - ImageElment[] from Angular (might have renamed files)
 * @param currentVideoFolder - source folder where videos are located (globals.selectedSourceFolder)
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
      globals.screenshotSettings,
      folderToDeleteFrom,
      sendFinalResultHome           // callback for when `extractAllMetadata` is called
    );

  } else {
    sendCurrentProgress(1, 1, 'done');
    dialog.showMessageBox({
      message: 'Directory ' + currentVideoFolder + ' does not exist',
      buttons: ['OK']
    });
  }
}

/**
 * Begin scanning for new files and importing them
 *
 * @param angularFinalArray  - ImageElment[] from Angular (might have renamed files)
 * @param currentVideoFolder - source folder where videos are located (globals.selectedSourceFolder)
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
      globals.screenshotSettings,
      sendFinalResultHome           // callback for when `extractAllMetadata` is called
    );

  } else {
    sendCurrentProgress(1, 1, 'done');
    dialog.showMessageBox({
      message: 'Directory ' + currentVideoFolder + ' does not exist',
      buttons: ['OK']
    });
  }
}


// ===========================================================================================
// RESCAN - ARCHIVED
// -------------------------------------------------------------------------------------------

/**
 * Initiate regenerating the library
 */
ipc.on('regenerate-library', function (event, currentAngularFinalArray: ImageElement[]) {
  const currentVideoFolder = globals.selectedSourceFolder;
  globals.cancelCurrentImport = false;
  regenerateMetadata(currentAngularFinalArray, currentVideoFolder);
});

/**
 * Completely regenerate the library and metadata, but preserve thumbnails and user generated metadata
 * Useful when new metadata is added eg.
 *
 * @param angularFinalArray  - ImageElment[] from Angular (might have renamed files)
 * @param currentVideoFolder - source folder where videos are located (globals.selectedSourceFolder)
 */
function regenerateMetadata(angularFinalArray: ImageElement[], currentVideoFolder: string) {

  // rescan the source directory
  if (fs.existsSync(currentVideoFolder)) {
    let videosOnHD: ImageElement[] = getVideoPathsAndNames(currentVideoFolder);

    if (demo) {
      videosOnHD = videosOnHD.slice(0, 50);
    }

    const folderToDeleteFrom = path.join(globals.selectedOutputFolder, 'vha-' + globals.hubName);

    regenerateLibrary(
      angularFinalArray,
      videosOnHD,
      currentVideoFolder,
      globals.screenshotSettings,
      folderToDeleteFrom,
      sendFinalResultHome           // callback for when `extractAllMetadata` is called
    );

  } else {
    sendCurrentProgress(1, 1, 'done');
    dialog.showMessageBox({
      message: 'Directory ' + currentVideoFolder + ' does not exist',
      buttons: ['OK']
    });
  }
}
