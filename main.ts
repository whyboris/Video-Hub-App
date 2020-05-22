import { GLOBALS } from './main-globals';
// =================================================================================================
// ----------------------------------------- BUILD TOGGLE ------------------------------------------
// -------------------------------------------------------------------------------------------------
const demo = false;
GLOBALS.version = '2.2.3';   // update `package.json` version to `#.#.#-demo` when building the demo
// =================================================================================================

import * as path from 'path';
import * as url from 'url';

const fs = require('fs');
const trash = require('trash');

import { app, BrowserWindow, screen, TouchBar } from 'electron';
const dialog = require('electron').dialog;
const electron = require('electron');
const ipc = require('electron').ipcMain;
const shell = require('electron').shell;
const { powerSaveBlocker } = require('electron');
const { systemPreferences } = require('electron');

// Methods
import {
  alphabetizeFinalArray,
  countFoldersInFinalArray,
  createDotPlsFile,
  extractAllMetadata,
  getVideoPathsAndNames,
  insertTemporaryFields,
  missingThumbsIndex,
  sendCurrentProgress,
  startFileSystemWatching,
  writeVhaFileToDisk
} from './main-support';

import {
  findAndImportNewFiles,
  regenerateLibrary,
  rescanAddAndDelete,
} from './main-rescan';

import { replaceThumbnailWithNewImage } from './main-extract';
import { AllSupportedViews, SupportedView } from './interfaces/shared-interfaces';
import { randomizeArray } from './utility';

// Interfaces
import {
  AllowedScreenshotHeight,
  FinalObject,
  ImageElement,
  InputSources
} from './interfaces/final-object.interface';
import { SavableProperties } from './interfaces/savable-properties.interface';
import { SettingsObject } from './interfaces/settings-object.interface';
import { WizardOptions } from './interfaces/wizard-options.interface';

// Variables
let lastSavedFinalObject: FinalObject; // hack for saving the `vha2` file again later

const codeRunningOnMac: boolean = process.platform === 'darwin';

const pathToAppData = app.getPath('appData');

const English = require('./i18n/en.json');
let systemMessages = English.SYSTEM; // Set English as default; update via `system-messages-updated`

let screenWidth;
let screenHeight;

let preventSleepId: number;

// TODO: CLEAN UP
let macFirstRun = true; // to detect if it's the first time Mac is opening the file or something like that
let userWantedToOpen: string = null; // find a better pattern for handling this functionality

// =================================================================================================

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

let win, serve;
let myWindow = null;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');
GLOBALS.debug = args.some(val => val === '--debug');

if (GLOBALS.debug) {
  console.log('Debug mode enabled!');
}

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

    // dialog.showMessageBox(win, {
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
    createTouchBar();
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

// =================================================================================================
// Methods
// -------------------------------------------------------------------------------------------------

/**
 * Load the .vha2 file and send it to app
 * @param pathToVhaFile full path to the .vha2 file
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

      dialog.showMessageBox(win, {
        message: systemMessages.noSuchFileFound,
        detail: pathToVhaFile,
        buttons: ['OK']
      });
      GLOBALS.angularApp.sender.send('pleaseOpenWizard');

    } else {

      GLOBALS.currentlyOpenVhaFile = pathToVhaFile;
      lastSavedFinalObject = JSON.parse(data);
      console.log('opened vha file version: ' + lastSavedFinalObject.version);

      // path to folder where the VHA file is
      GLOBALS.selectedOutputFolder = path.parse(pathToVhaFile).dir;
      // use relative paths
      // if (lastSavedFinalObject.inputDirs.size === 0) {
      //   lastSavedFinalObject.inputDirs.set(0, GLOBALS.selectedOutputFolder);
      // }

      if (lastSavedFinalObject.version === 2 && !lastSavedFinalObject.inputDirs) {
        console.log('OLD VERSION FILE !!!');
        lastSavedFinalObject.inputDirs = { 0: { path: '', watch: false } };
        lastSavedFinalObject.inputDirs[0].path = (lastSavedFinalObject as any).inputDir;
      }

      console.log('about to start watching for files');

      Object.keys(lastSavedFinalObject.inputDirs).forEach((key: string) => {

        console.log(key); // type: string!
        console.log(lastSavedFinalObject.inputDirs[key]);

        console.log(' SYSTEM WATCHIND DISABLED !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        if (lastSavedFinalObject.inputDirs[key].watch) {
          // startFileSystemWatching(lastSavedFinalObject.inputDirs[key].path, parseInt(key), lastSavedFinalObject.images, false);
        }
      });


      let changedRootFolder = false;
      let rootFolderLive = true;

      // check root folder exists
      if (!fs.existsSync(lastSavedFinalObject.inputDirs[0].path)) {
        // see if the user wants to change the root folder
        const buttonIndex: number = dialog.showMessageBoxSync(win, {
          message: systemMessages.videoFolderNotFound,
          detail: lastSavedFinalObject.inputDirs[0].path,
          buttons: [
            systemMessages.selectRootFolder, // 0
            systemMessages.continueAnyway,   // 1
            systemMessages.cancel            // 2
          ]
        });

        // Select Root Folder
        if (buttonIndex === 0) {
          // select the new root folder
          const pathsArray: any = dialog.showOpenDialogSync(win, {
            //                      ^^^^^^^^^^^^^^^^^^ returns `string[]`
            properties: ['openDirectory']
          });

          const inputDirPath: string = pathsArray[0];

          if (inputDirPath) {
            // update the root folder
            lastSavedFinalObject.inputDirs[0].path = inputDirPath;
            changedRootFolder = true;
          } else {
            // show the wizard instead
            lastSavedFinalObject = null;
            GLOBALS.angularApp.sender.send('pleaseOpenWizard');
            return;
          }

          // Continue anyway
        } else if (buttonIndex === 1) {
          console.log('PROCEED ANYWAY');
          rootFolderLive = false;

          // Cancel
        } else if (buttonIndex === 2) {
          console.log('CANCEL');
          // show the wizard instead
          lastSavedFinalObject = null;
          GLOBALS.angularApp.sender.send('pleaseOpenWizard');
          return;
        }

        console.log('THIS SHOULD NOT RUN UNTIL MODAL CLICKED !!!');

      }

      setGlobalsFromVhaFile(lastSavedFinalObject); // sets source folder ETC

      lastSavedFinalObject.images = insertTemporaryFields(lastSavedFinalObject.images);

      console.log(GLOBALS.selectedSourceFolder[0].path + ' - videos location');
      console.log(GLOBALS.selectedOutputFolder + ' - output location');

      GLOBALS.angularApp.sender.send(
        'finalObjectReturning',
        lastSavedFinalObject,
        pathToVhaFile,
        getHtmlPath(GLOBALS.selectedOutputFolder),
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
  GLOBALS.hubName = vhaFileContents.hubName;
  GLOBALS.screenshotSettings = vhaFileContents.screenshotSettings;
  GLOBALS.selectedSourceFolder = vhaFileContents.inputDirs;
}

// ========================================================================================
// Methods that interact with Angular
// ========================================================================================

/**
 * Just started -- hello -- send over the settings or open wizard
 */
ipc.on('just-started', (event) => {
  GLOBALS.angularApp = event;
  GLOBALS.winRef = win;

  if (codeRunningOnMac) {
    tellElectronDarkModeChange(systemPreferences.getEffectiveAppearance());
  }

  fs.readFile(path.join(pathToAppData, 'video-hub-app-2', 'settings.json'), (err, data) => {
    if (err) {
      win.setBounds({x: 0, y: 0, width: screenWidth, height: screenHeight});
      event.sender.send('pleaseOpenWizard', true); // firstRun = true!
    } else {

      const savedSettings = JSON.parse(data);

      // Restore last windows size and position or full screen if not available
      if (savedSettings.windowSizeAndPosition
        && savedSettings.windowSizeAndPosition.x < screenWidth - 200
        && savedSettings.windowSizeAndPosition.y < screenHeight - 200) {
        win.setBounds(savedSettings.windowSizeAndPosition);
      } else {
        win.setBounds({x: 0, y: 0, width: screenWidth, height: screenHeight});
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
ipc.on('openThisFile', (event, fullFilePath) => {
  shell.openItem(path.normalize(fullFilePath)); // normalize because on windows, the path sometimes is mixing `\` and `/`
});

const spawn = require('child_process').spawn;

/**
 * Open a particular video file clicked inside Angular
 */
ipc.on('openThisFileWithFlags', (event, executablePath, fullFilePath: string, argz: string[]) => {
  const allArgs: string[] = [];
  allArgs.push(path.normalize(fullFilePath));
  allArgs.push(...argz);
  console.log(allArgs);
  spawn(path.normalize(executablePath), allArgs);
});

ipc.on('select-default-video-player', (event) => {
  console.log('asking for default video player');
  dialog.showOpenDialog(win, {
    title: systemMessages.selectDefaultPlayer,
    filters: [{
      name: 'Executable', // TODO: i18n fixme
      extensions: ['exe', 'app']
    }],
    properties: ['openFile']
  }).then(result => {
    const executablePath: string = result.filePaths[0];
    if (executablePath) {
      event.sender.send('preferred-video-player-returning', executablePath);
    }
  }).catch(err => {
    console.log('select default video player: this should not happen!');
    console.log(err);
  });
});

/**
 * Open the explorer to the relevant file
 */
ipc.on('openInExplorer', (event, fullPath: string) => {
  shell.showItemInFolder(fullPath);
});

/**
 * Open a URL in system's default browser
 */
ipc.on('pleaseOpenUrl', (event, urlToOpen: string): void => {
  shell.openExternal(urlToOpen, {activate: true});
});

/**
 * Maximize the window
 */
ipc.on('maximize-window', (event) => {
  if (BrowserWindow.getFocusedWindow()) {
    BrowserWindow.getFocusedWindow().maximize();
  }
});

/**
 * Create and play the playlist
 * 1. filter out *FOLDER*
 * 2. save .pls file
 * 3. ask OS to open the .pls file
 */
ipc.on('please-create-playlist', (event, playlist: ImageElement[]) => {

  const cleanPlaylist: ImageElement[] = playlist.filter((element: ImageElement) => {
    return element.cleanName !== '*FOLDER*';
  });

  const savePath: string = path.join(pathToAppData, 'video-hub-app-2', 'temp.pls');

  if (cleanPlaylist.length) {
    createDotPlsFile(savePath, cleanPlaylist, () => {
      shell.openItem(savePath);
    });
  }

});

/**
 * Delete file from computer (send to recycling bin / trash)
 */
ipc.on('delete-video-file', (event, item: ImageElement): void => {
  const fileToDelete = path.join(GLOBALS.selectedSourceFolder[0].path, item.partialPath, item.fileName);

  (async () => {
    await trash(fileToDelete);

    // check if file exists
    fs.access(fileToDelete, fs.F_OK, (err: any) => {
      if (err) {
        event.sender.send('file-deleted', item);
      }
    });

  })();
});

/**
 * Method to replace thumbnail of a particular item
 */
ipc.on('replace-thumbnail', (event, pathToIncomingJpg: string, item: ImageElement) => {
  const fileToReplace: string = path.join(GLOBALS.selectedOutputFolder, 'vha-' + GLOBALS.hubName, 'thumbnails', item.hash + '.jpg');


  if (fs.existsSync(fileToReplace)) {
    const height: number = GLOBALS.screenshotSettings.height;

    replaceThumbnailWithNewImage(fileToReplace, pathToIncomingJpg, height)
      .then(success => {
        if (success) {
          event.sender.send('thumbnail-replaced');
        }
      })
      .catch((err) => {
        // console.log(err);
      });
  }
});

/**
 * Un-Maximize the window
 */
ipc.on('un-maximize-window', (event) => {
  if (BrowserWindow.getFocusedWindow()) {
    BrowserWindow.getFocusedWindow().unmaximize();
  }
});

/**
 * Minimize the window
 */
ipc.on('minimize-window', (event) => {
  if (BrowserWindow.getFocusedWindow()) {
    BrowserWindow.getFocusedWindow().minimize();
  }
});

/**
 * Minimize the window
 */
ipc.on('prevent-sleep', (event) => {
  console.log('preventing sleep lol!');
  preventSleepId = powerSaveBlocker.start('prevent-app-suspension');
});

ipc.on('allow-sleep', (event) => {
  console.log('allowing sleep again');
  powerSaveBlocker.stop(preventSleepId);
});

/**
 * Summon system modal to choose INPUT directory
 * where all the videos are located
 */
ipc.on('choose-input', (event) => {
  dialog.showOpenDialog(win, {
    properties: ['openDirectory']
  }).then(result => {
    const inputDirPath: string = result.filePaths[0];
    if (inputDirPath) {
      event.sender.send('inputFolderChosen', inputDirPath, getVideoPathsAndNames(inputDirPath));
    }
  }).catch(err => {
    console.log('choose-input: this should not happen!');
    console.log(err);
  });
});

/**
 * Summon system modal to choose OUTPUT directory
 * where the final .vha2 file, vha-folder, and all screenshots will be saved
 */
ipc.on('choose-output', (event) => {
  dialog.showOpenDialog(win, {
    properties: ['openDirectory']
  }).then(result => {
    const outputDirPath: string = result.filePaths[0];
    if (outputDirPath) {
      event.sender.send('outputFolderChosen', outputDirPath);
    }
  }).catch(err => {
    console.log('choose-output: this should not happen!');
    console.log(err);
  });
});

/**
 * Close the window / quit / exit the app
 */
ipc.on('close-window', (event, settingsToSave: SettingsObject, savableProperties: SavableProperties) => {

  // save window size and position
  settingsToSave.windowSizeAndPosition = win.getContentBounds();

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
      writeVhaFileToDisk(lastSavedFinalObject, GLOBALS.currentlyOpenVhaFile, () => {
        // file writing done !!!
        console.log('.vha2 file written before closing !!!');
        try {
          BrowserWindow.getFocusedWindow().close();
        } catch (e) {
          // Window was already closed
        }
      });
    } else {
      try {
        BrowserWindow.getFocusedWindow().close();
      } catch (e) {
        // Window was already closed
      }
    }
  });
});

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
  console.log('new translated system messages recieved !!!');
  systemMessages = newSystemMessages;
});

/**
 * Start extracting the screenshots into a chosen output folder from a chosen input folder
 */
ipc.on('start-the-import', (event, wizard: WizardOptions, videoFilesWithPaths: ImageElement[]) => {

  const hubName = wizard.futureHubName;
  const outDir: string = wizard.selectedOutputFolder;

  // make sure no hub name under the same name exists
  if (fs.existsSync(path.join(outDir, hubName + '.vha2'))) {

    dialog.showMessageBox(win, {
      message: systemMessages.hubAlreadyExists +
        '\n' + systemMessages.pleaseChangeName,
      buttons: ['OK']
    });

    event.sender.send('pleaseFixHubName');

  } else {

    // create the folder `vha-hubName` inside the output directory
    if (!fs.existsSync(path.join(outDir, 'vha-' + hubName))) {
      console.log('vha-hubName folder did not exist, creating');
      fs.mkdirSync(path.join(outDir, 'vha-' + hubName));
      fs.mkdirSync(path.join(outDir, 'vha-' + hubName + '/filmstrips'));
      fs.mkdirSync(path.join(outDir, 'vha-' + hubName + '/thumbnails'));
      fs.mkdirSync(path.join(outDir, 'vha-' + hubName + '/clips'));
    }

    GLOBALS.cancelCurrentImport = false;
    GLOBALS.hubName = hubName;
    GLOBALS.selectedOutputFolder = outDir;
    GLOBALS.selectedSourceFolder = wizard.selectedSourceFolder;

    // determine number of screenshots
    let numOfScreenshots: number = 0;
    if (wizard.isFixedNumberOfScreenshots) {
      numOfScreenshots = wizard.ssConstant;
    } else {
      numOfScreenshots = wizard.ssVariable;
    }
    GLOBALS.screenshotSettings = {
      clipHeight: wizard.clipHeight,
      clipSnippetLength: wizard.clipSnippetLength,
      clipSnippets: wizard.extractClips ? wizard.clipSnippets : 0,
      fixed: wizard.isFixedNumberOfScreenshots,
      height: wizard.screenshotSizeForImport,
      n: numOfScreenshots,
    };

    if (demo) {
      videoFilesWithPaths = videoFilesWithPaths.slice(0, 50);
    }

    // extractAllMetadata(
    //   videoFilesWithPaths,
    //   GLOBALS.selectedSourceFolder,
    //   GLOBALS.screenshotSettings,
    //   0,
    //   sendFinalResultHome         // callback for when metdata is done extracting
    // );

    sendFinalResultHome([]);

    startFileSystemWatching(GLOBALS.selectedSourceFolder[0].path, 0, [], false);

    // Currently not needed -- start import happens on wizard and wizard currently only allows for ONE source folder

    // Object.keys(GLOBALS.selectedSourceFolder).forEach((key) => {

    //   console.log(key);
    //   console.log(GLOBALS.selectedSourceFolder[key]);
    //   console.log(typeof(key));

    //   startFileSystemWatching(GLOBALS.selectedSourceFolder[key], parseInt(key), [], false);
    // });


  }

});

/**
 * Summon system modal to choose the *.vha file
 * send images object to App
 * send settings object to App
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
      // console.log('the user has chosen this previously-saved .vha file: ' + chosenFile);
      // TODO: fix up this stupid pattern of overriding method with variable ?
      userWantedToOpen = chosenFile;
      openThisDamnFile(chosenFile);
    }
  }).catch(err => {
    console.log('system open file through modal: this should not happen');
    console.log(err);
  });
});

/**
 * Import this .vha file
 */
ipc.on('load-this-vha-file', (event, pathToVhaFile: string, savableProperties: SavableProperties) => {

  if (savableProperties !== null) {

    lastSavedFinalObject.addTags = savableProperties.addTags;
    lastSavedFinalObject.removeTags = savableProperties.removeTags;
    lastSavedFinalObject.images = savableProperties.images;
    lastSavedFinalObject.inputDirs = savableProperties.inputSources;

    writeVhaFileToDisk(lastSavedFinalObject, GLOBALS.currentlyOpenVhaFile, () => {
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
    version: GLOBALS.vhaFileVersion,
    hubName: GLOBALS.hubName,
    inputDirs: GLOBALS.selectedSourceFolder,
    numOfFolders: countFoldersInFinalArray(myFinalArray),
    screenshotSettings: GLOBALS.screenshotSettings,
    images: myFinalArray,
  };

  lastSavedFinalObject = finalObject;

  const pathToTheFile = path.join(GLOBALS.selectedOutputFolder, GLOBALS.hubName + '.vha2');

  writeVhaFileToDisk(finalObject, pathToTheFile, () => {

    GLOBALS.currentlyOpenVhaFile = pathToTheFile;

    finalObject.images = insertTemporaryFields(finalObject.images);

    GLOBALS.angularApp.sender.send(
      'finalObjectReturning',
      finalObject,
      pathToTheFile,
      getHtmlPath(GLOBALS.selectedOutputFolder)
    );

    const screenshotOutputFolder: string = path.join(GLOBALS.selectedOutputFolder, 'vha-' + GLOBALS.hubName);

    const indexesToScan: number[] = missingThumbsIndex(
      myFinalArray,
      screenshotOutputFolder,
      GLOBALS.screenshotSettings.clipSnippets > 0 // convert number to appropriate boolean
    );

    // extractFromTheseFiles(
    //   myFinalArray,
    //   GLOBALS.selectedSourceFolder,
    //   screenshotOutputFolder,
    //   GLOBALS.screenshotSettings,
    //   indexesToScan,
    //   false
    // );

  });
}


// ===========================================================================================
// RESCAN - electron messages
// -------------------------------------------------------------------------------------------

/**
 * Initiate scanning for new files and importing them
 * Now receives the finalArray from `home.component`
 * because the user may have renamed files from within the app!
 */
ipc.on('only-import-new-files', (event, currentAngularFinalArray: ImageElement[]) => {
  const currentVideoFolder = GLOBALS.selectedSourceFolder;
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
  const currentVideoFolder = GLOBALS.selectedSourceFolder;
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

// ===========================================================================================
// RESCAN - methods
// -------------------------------------------------------------------------------------------

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

  // extractFromTheseFiles(
  //   finalArray,
  //   GLOBALS.selectedSourceFolder,
  //   screenshotOutputFolder,
  //   GLOBALS.screenshotSettings,
  //   randomizeArray(indexesToScan), // extract screenshots in random order
  //   true
  // );
}

/**
 * Begins rescan procedure compared to what the app has currently
 *
 * @param angularFinalArray  - ImageElment[] from Angular (might have renamed files)
 * @param currentVideoFolder - source folder where videos are located (GLOBALS.selectedSourceFolder)
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
 * @param currentVideoFolder - source folder where videos are located (GLOBALS.selectedSourceFolder)
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


// ===========================================================================================
// RESCAN - ARCHIVED
// -------------------------------------------------------------------------------------------

/**
 * Initiate regenerating the library
 */
ipc.on('regenerate-library', (event, currentAngularFinalArray: ImageElement[]) => {
  const currentVideoFolder = GLOBALS.selectedSourceFolder;
  GLOBALS.cancelCurrentImport = false;
  regenerateMetadata(currentAngularFinalArray, currentVideoFolder[0].path);
});

/**
 * Completely regenerate the library and metadata, but preserve thumbnails and user generated metadata
 * Useful when new metadata is added eg.
 *
 * @param angularFinalArray  - ImageElment[] from Angular (might have renamed files)
 * @param currentVideoFolder - source folder where videos are located (GLOBALS.selectedSourceFolder)
 */
function regenerateMetadata(angularFinalArray: ImageElement[], currentVideoFolder: string) {

  // rescan the source directory
  if (fs.existsSync(currentVideoFolder)) {
    let videosOnHD: ImageElement[] = getVideoPathsAndNames(currentVideoFolder);

    if (demo) {
      videosOnHD = videosOnHD.slice(0, 50);
    }

    const folderToDeleteFrom = path.join(GLOBALS.selectedOutputFolder, 'vha-' + GLOBALS.hubName);

    regenerateLibrary(
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


// =========================================================================================================================================
//     TOUCH BAR
// -----------------------------------------------------------------------------------------------------------------------------------------

ipc.on('app-to-touchBar', (event, changesFromApp) => {
  if (codeRunningOnMac) {
    if (AllSupportedViews.includes(<SupportedView>changesFromApp)) {
      segmentedViewControl.selectedIndex = AllSupportedViews.indexOf(changesFromApp);
    } else if (changesFromApp === 'showFreq') {
      segmentedFolderControl.selectedIndex = 0;
    } else if (changesFromApp === 'showRecent') {
      segmentedFolderControl.selectedIndex = 1;
    } else if (changesFromApp === 'compactView') {
      segmentedAnotherViewsControl.selectedIndex = 0;
    } else if (changesFromApp === 'showMoreInfo') {
      segmentedAnotherViewsControl.selectedIndex = 1;
    }
  }
});

const nativeImage = require('electron').nativeImage;
const resourcePath = serve ? path.join(__dirname, 'src/assets/icons/mac/touch-bar/') : path.join(process.resourcesPath, 'assets/');
const {
  TouchBarPopover,
  TouchBarSegmentedControl
} = TouchBar;

// touchBar variables
let touchBar,
    segmentedAnotherViewsControl,
    segmentedFolderControl,
    segmentedPopover,
    segmentedViewControl,
    zoomSegmented;

/**
 * Void function for creating touchBar for MAC OS X
 */
function createTouchBar() {

  // recent and freq views
  segmentedFolderControl = new TouchBarSegmentedControl({
    mode: 'multiple',
    selectedIndex: -1,
    segments: [
      {
        icon: nativeImage.createFromPath(path.join(resourcePath, 'icon-cloud.png')).resize({
          width: 22,
          height: 16
        })
      },
      {
        icon: nativeImage.createFromPath(path.join(resourcePath, 'icon-recent-history.png')).resize({
          width: 18,
          height: 18
        })
      }
    ],
    change: selectedIndex => {
      if (selectedIndex === 0) {
        GLOBALS.angularApp.sender.send('touchBar-to-app', 'showFreq');
      } else {
        GLOBALS.angularApp.sender.send('touchBar-to-app', 'showRecent');
      }
    }
  });

  // segmentedControl for views
  segmentedViewControl = new TouchBarSegmentedControl({
    segments: [
      {
        icon: nativeImage.createFromPath(path.join(resourcePath, 'icon-show-thumbnails.png')).resize({
          width: 15,
          height: 15
        })
      },
      {
        icon: nativeImage.createFromPath(path.join(resourcePath, 'icon-show-filmstrip.png')).resize({
          width: 20,
          height: 15
        })
      },
      {
        icon: nativeImage.createFromPath(path.join(resourcePath, 'icon-show-full-view.png')).resize({
          width: 15,
          height: 15
        })
      },
      {
        icon: nativeImage.createFromPath(path.join(resourcePath, 'icon-show-details.png')).resize({
          width: 15,
          height: 15
        })
      },
      {
        icon: nativeImage.createFromPath(path.join(resourcePath, 'icon-show-filenames.png')).resize({
          width: 15,
          height: 15
        })
      },
      {
        icon: nativeImage.createFromPath(path.join(resourcePath, 'icon-video-blank.png')).resize({
          width: 15,
          height: 15
        })
      },
    ],
    change: selectedIndex => {
      GLOBALS.angularApp.sender.send('touchBar-to-app', AllSupportedViews[selectedIndex]);
    }
  });

  // Popover button for segmentedControl
  segmentedPopover = new TouchBarPopover({
    label: 'Views',
    items: new TouchBar(
      {
        items: [segmentedViewControl]
      }
    )
  });

  // Segment with compat view and show more info
  segmentedAnotherViewsControl = new TouchBarSegmentedControl({
    mode: 'multiple',
    selectedIndex: -1,
    segments: [
      {
        icon: nativeImage.createFromPath(path.join(resourcePath, 'icon-compat-view.png')).resize({
          width: 16,
          height: 16
        })
      },
      {
        icon: nativeImage.createFromPath(path.join(resourcePath, 'icon-show-more-info.png')).resize({
          width: 18,
          height: 20
        })
      },
    ],
    change: selectedIndex => {
      if (selectedIndex === 0) {
        GLOBALS.angularApp.sender.send('touchBar-to-app', 'compactView');
      } else {
        GLOBALS.angularApp.sender.send('touchBar-to-app', 'showMoreInfo');
      }
    }
  });

  // touchBar segment with zoom options
  zoomSegmented = new TouchBarSegmentedControl({
    mode: 'buttons',
    segments: [
      {label: '-'},
      {label: '+'}
    ],
    change: selectedIndex => {
      if (selectedIndex === 0) {
        GLOBALS.angularApp.sender.send('touchBar-to-app', 'makeSmaller');
      } else {
        GLOBALS.angularApp.sender.send('touchBar-to-app', 'makeLarger');
      }
    }
  });

  // creating touchBar from existing items
  touchBar = new TouchBar({
    items: [
      segmentedFolderControl,
      segmentedPopover,
      segmentedAnotherViewsControl,
      zoomSegmented
    ]
  });
}

