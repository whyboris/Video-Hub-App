import { GLOBALS, VhaGlobals } from './main-globals';
// =================================================================================================
// -------------------------------------     BUILD TOGGLE     --------------------------------------
// -------------------------------------------------------------------------------------------------
const demo = false;
GLOBALS.version = '3.0.0';   // update `package.json` version to `#.#.#-demo` when building the demo
// =================================================================================================

import * as path from 'path';
import * as url from 'url';

const fs = require('fs');
const trash = require('trash');

import { app, BrowserWindow, screen } from 'electron';
const dialog = require('electron').dialog;
const electron = require('electron');
const ipc = require('electron').ipcMain;
const shell = require('electron').shell;
const { systemPreferences } = require('electron');

// Methods
import {
  alphabetizeFinalArray,
  countFoldersInFinalArray,
  createDotPlsFile,
  extractAllMetadata,
  getHtmlPath,
  getVideoPathsAndNames,
  insertTemporaryFields,
  missingThumbsIndex,
  sendCurrentProgress,
  sendFinalObjectToAngular,
  startFileSystemWatching,
  startWatchingDirs,
  upgradeToVersion3,
  writeVhaFileToDisk
} from './main-support';

import {
  findAndImportNewFiles,
  regenerateLibrary,
  rescanAddAndDelete,
} from './main-rescan';

import { createTouchBar } from './main-touch-bar';
import { setUpIpcMessages } from './main-ipc';

// Interfaces
import { FinalObject, ImageElement } from './interfaces/final-object.interface';
import { SettingsObject } from './interfaces/settings-object.interface';
import { WizardOptions } from './interfaces/wizard-options.interface';

// Variables
const pathToAppData = app.getPath('appData');
const codeRunningOnMac: boolean = process.platform === 'darwin';
const English = require('./i18n/en.json');
let systemMessages = English.SYSTEM; // Set English as default; update via `system-messages-updated`

let screenWidth;
let screenHeight;

// TODO: CLEAN UP
let macFirstRun = true; // detect if it's the 1st time Mac is opening the file or something like that
let userWantedToOpen: string = null; // find a better pattern for handling this functionality

// =================================================================================================

const spawn = require('child_process').spawn;

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

let win, serve;
let myWindow = null;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');
GLOBALS.debug = args.some(val => val === '--debug');

if (GLOBALS.debug) {
  console.log('Debug mode enabled!');
}

// For windows -- when loading the app the first time
if (args[0]) {
  if (!serve) {
    userWantedToOpen = args[0]; // TODO -- clean up file-opening code to not use viarable
  }
}

// OPEN FILE ON WINDOWS FROM FILE DOUBLE CLICK
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {

  app.on('second-instance', (event, argv: string[], workingDirectory: string) => {

    // dialog.showMessageBox(win, {
    //   message: 'second-instance: \n' + argv[0] + ' \n' + argv[1],
    //   buttons: ['OK']
    // });

    if (argv[1]) {
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

  if (codeRunningOnMac) {
    const touchBar = createTouchBar();
    if (touchBar) {
      win.setTouchBar(touchBar);
    }
  }

  // Watch for computer powerMonitor
  // https://electronjs.org/docs/api/power-monitor
  electron.powerMonitor.on('shutdown', () => {
    GLOBALS.angularApp.sender.send('pleaseShutDownASAP');
  });

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

try {

  // OPEN FILE ON MAC FROM FILE DOUBLE CLICK
  // THIS RUNS (ONLY) on MAC !!!
  app.on('will-finish-launching', () => {
    app.on('open-file', (event, filePath: string) => {
      if (filePath) {
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

} catch {}

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

// =================================================================================================
// Methods
// -------------------------------------------------------------------------------------------------

/**
 * Load the .vha2 file and send it to app
 * @param pathToVhaFile full path to the .vha2 file
 */
function openThisDamnFile(pathToVhaFile: string) {
  macFirstRun = false;     // TODO - figure out how to open file when double click first time on Mac

  if (userWantedToOpen) {                                          // TODO - clean up messy override
    pathToVhaFile = userWantedToOpen;
    userWantedToOpen = undefined;
  }

  fs.readFile(pathToVhaFile, (err, data) => {
    if (err) {

      dialog.showMessageBox(win, {
        message: systemMessages.noSuchFileFound,
        detail: pathToVhaFile,
        buttons: ['OK']
      });
      GLOBALS.angularApp.sender.send('pleaseOpenWizard');

    } else {

      const finalObject: FinalObject = JSON.parse(data);

      // set globals from file
      GLOBALS.currentlyOpenVhaFile = pathToVhaFile;
      GLOBALS.selectedOutputFolder = path.parse(pathToVhaFile).dir;
      GLOBALS.hubName = finalObject.hubName;
      GLOBALS.screenshotSettings = finalObject.screenshotSettings;
      upgradeToVersion3(finalObject); // `inputDir` -> `inputDirs`
      GLOBALS.selectedSourceFolders = finalObject.inputDirs;

      sendFinalObjectToAngular(finalObject, GLOBALS);

      startWatchingDirs(finalObject.inputDirs, false); // starts `chokidar`
    }
  });
}

// ========================================================================================
// Listeners for events from Angular
// ========================================================================================

setUpIpcMessages(ipc, win, pathToAppData, systemMessages);

/**
 * Once Angular loads it sends over the `ready` status
 * Load up the settings.json and send settings over to Angular
 */
ipc.on('just-started', (event) => {
  GLOBALS.angularApp = event;
  GLOBALS.winRef = win;

  if (codeRunningOnMac) {
    tellElectronDarkModeChange(systemPreferences.getEffectiveAppearance());
  }

  // Reference: https://github.com/electron/electron/blob/master/docs/api/locales.md
  const locale: string = app.getLocale();

  fs.readFile(path.join(pathToAppData, 'video-hub-app-2', 'settings.json'), (err, data) => {
    if (err) {
      win.setBounds({ x: 0, y: 0, width: screenWidth, height: screenHeight });
      event.sender.send('set-language-based-off-system-locale', locale);
      event.sender.send('pleaseOpenWizard', true); // firstRun = true!
    } else {

      const previouslySavedSettings: SettingsObject = JSON.parse(data);

      // Restore last windows size and position or full screen if not available
      if ( previouslySavedSettings.windowSizeAndPosition
        && previouslySavedSettings.windowSizeAndPosition.x < screenWidth - 200
        && previouslySavedSettings.windowSizeAndPosition.y < screenHeight - 200) {
        win.setBounds(previouslySavedSettings.windowSizeAndPosition);
      } else {
        win.setBounds({ x: 0, y: 0, width: screenWidth, height: screenHeight });
      }

      event.sender.send('settingsReturning', previouslySavedSettings, locale);
    }
  });
});

/**
 * Start extracting the screenshots into a chosen output folder from a chosen input folder
 */
ipc.on('start-the-import', (event, wizard: WizardOptions) => {
  const hubName = wizard.futureHubName;
  const outDir: string = wizard.selectedOutputFolder;

  if (fs.existsSync(path.join(outDir, hubName + '.vha2'))) { // make sure no hub name under the same name exists
    dialog.showMessageBox(win, {
      message: systemMessages.hubAlreadyExists +
        '\n' + systemMessages.pleaseChangeName,
      buttons: ['OK']
    });
    event.sender.send('pleaseFixHubName');
  } else {

    if (!fs.existsSync(path.join(outDir, 'vha-' + hubName))) { // create the folder `vha-hubName` inside the output directory
      console.log('vha-hubName folder did not exist, creating');
      fs.mkdirSync(path.join(outDir, 'vha-' + hubName));
      fs.mkdirSync(path.join(outDir, 'vha-' + hubName + '/filmstrips'));
      fs.mkdirSync(path.join(outDir, 'vha-' + hubName + '/thumbnails'));
      fs.mkdirSync(path.join(outDir, 'vha-' + hubName + '/clips'));
    }

    GLOBALS.cancelCurrentImport = false;
    GLOBALS.hubName = hubName;
    GLOBALS.selectedOutputFolder = outDir;
    GLOBALS.selectedSourceFolders = wizard.selectedSourceFolder;
    GLOBALS.screenshotSettings = {
      clipHeight: wizard.clipHeight,
      clipSnippetLength: wizard.clipSnippetLength,
      clipSnippets: wizard.extractClips ? wizard.clipSnippets : 0,
      fixed: wizard.isFixedNumberOfScreenshots,
      height: wizard.screenshotSizeForImport,
      n: wizard.isFixedNumberOfScreenshots ? wizard.ssConstant : wizard.ssVariable,
    };

    writeVhaFileAndStartExtraction();
  }

});

/**
 * Creates a FinalObject with known data (no ImageElement[])
 * Writes to disk, sends to Angular, starts watching directories
 */
function writeVhaFileAndStartExtraction(): void {

  const finalObject: FinalObject = {
    addTags: [],
    hubName: GLOBALS.hubName,
    images: [],
    inputDirs: GLOBALS.selectedSourceFolders,
    numOfFolders: 0,
    removeTags: [],
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
 * Notify front-end about OS change in Dark Mode setting
 * @param mode
 */
function tellElectronDarkModeChange(mode: string) {
  GLOBALS.angularApp.sender.send('osDarkModeChange', mode);
}

/**
 * Interrupt current import process
 */
ipc.on('cancel-current-import', (event): void => {
  GLOBALS.cancelCurrentImport = true;
});

ipc.on('system-messages-updated', (event, newSystemMessages): void => {
  systemMessages = newSystemMessages;
});


/**
 * Close the window / quit / exit the app
 */
ipc.on('close-window', (event, settingsToSave: SettingsObject, finalObjectToSave: FinalObject) => {

  // save window size and position
  settingsToSave.windowSizeAndPosition = win.getContentBounds();

  // convert shortcuts map to object
  // someday when node stops giving error: Property 'fromEntries' does not exist on type 'ObjectConstructor'
  // settingsToSave.shortcuts = <any>Object.fromEntries(settingsToSave.shortcuts);
  // until then: https://gist.github.com/lukehorvat/133e2293ba6ae96a35ba#gistcomment-2600839
  let obj = Array.from(settingsToSave.shortcuts).reduce((obj, [key, value]) => {
    obj[key] = value;
    return obj;
  }, {});
  settingsToSave.shortcuts = <any>obj;

  const json = JSON.stringify(settingsToSave);

  try {
    fs.statSync(path.join(pathToAppData, 'video-hub-app-2'));
  } catch (e) {
    fs.mkdirSync(path.join(pathToAppData, 'video-hub-app-2'));
  }

  // TODO -- catch bug if user closes before selecting the output folder ?!??
  fs.writeFile(path.join(pathToAppData, 'video-hub-app-2', 'settings.json'), json, 'utf8', () => {
    if (finalObjectToSave !== null) {

      writeVhaFileToDisk(finalObjectToSave, GLOBALS.currentlyOpenVhaFile, () => {
        try {
          BrowserWindow.getFocusedWindow().close();
        } catch {}
      });

    } else {
      try {
        BrowserWindow.getFocusedWindow().close();
      } catch {}
    }
  });
});

/**
 * Summon system modal to choose the *.vha2 file
 * open via `openThisDamnFile` method
 */
ipc.on('system-open-file-through-modal', (event, somethingElse) => {
  dialog.showOpenDialog(win, {
    title: systemMessages.selectPreviousHub,
    filters: [{
      name: 'Video Hub App 2 files', // TODO -- i18n FIX ME
      extensions: ['vha2']
    }],
    properties: ['openFile']
  }).then(result => {
    const chosenFile: string = result.filePaths[0];

    if (chosenFile) {
      openThisDamnFile(chosenFile);
    }
  }).catch(err => {});
});

/**
 * Import this .vha file
 */
ipc.on('load-this-vha-file', (event, pathToVhaFile: string, finalObjectToSave: FinalObject) => {

  if (finalObjectToSave !== null) {

    writeVhaFileToDisk(finalObjectToSave, GLOBALS.currentlyOpenVhaFile, () => {
      console.log('.vha2 file saved before opening another');
      openThisDamnFile(pathToVhaFile);
    });

  } else {
    openThisDamnFile(pathToVhaFile);
  }
});

ipc.on('try-to-rename-this-file', (event, sourceFolder: string, relPath: string, file: string, renameTo: string, index: number): void => {
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

  GLOBALS.angularApp.sender.send('renameFileResponse', index, success, renameTo, file, errMsg);
});

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
