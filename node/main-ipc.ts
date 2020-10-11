import { BrowserWindow } from 'electron';
const { powerSaveBlocker } = require('electron');
const dialog = require('electron').dialog;
const shell = require('electron').shell;

import * as path from 'path';
const fs = require('fs');
const trash = require('trash');
const exec = require('child_process').exec;

import { GLOBALS } from './main-globals';
import { ImageElement, FinalObject, InputSources } from '../interfaces/final-object.interface';
import { SettingsObject } from '../interfaces/settings-object.interface';
import { createDotPlsFile, writeVhaFileToDisk } from './main-support';
import { replaceThumbnailWithNewImage } from './main-extract';
import { closeWatcher, startWatcher, extractAnyMissingThumbs, removeThumbnailsNotInHub } from './main-extract-async';

let preventSleepId: number;

/**
 * Set up the listeners
 * @param ipc
 * @param win
 * @param pathToAppData
 * @param systemMessages
 */
export function setUpIpcMessages(ipc, win, pathToAppData, systemMessages) {

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
   * Prevent PC from going to sleep during screenshot extraction
   */
  ipc.on('prevent-sleep', (event) => {
    console.log('preventing sleep');
    preventSleepId = powerSaveBlocker.start('prevent-app-suspension');
  });

  /**
   * Allow PC to go to sleep after screenshots were extracted
   */
  ipc.on('allow-sleep', (event) => {
    console.log('allowing sleep');
    powerSaveBlocker.stop(preventSleepId);
  });

  /**
   * Open the explorer to the relevant file
   */
  ipc.on('open-in-explorer', (event, fullPath: string) => {
    shell.showItemInFolder(fullPath);
  });

  /**
   * Open a URL in system's default browser
   */
  ipc.on('please-open-url', (event, urlToOpen: string): void => {
    shell.openExternal(urlToOpen, { activate: true });
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
   * Open a particular video file clicked inside Angular
   */
  ipc.on('open-media-file', (event, fullFilePath) => {
    shell.openItem(path.normalize(fullFilePath)); // normalize because on windows, the path sometimes is mixing `\` and `/`
    // shell.openPath(path.normalize(fullFilePath)); // Electron 9
  });

  /**
   * Handle dragging a file out of VHA into a video editor (e.g. Vegas or Premiere)
   */
  ipc.on('drag-video-out-of-electron', (event, filePath): void => {
    console.log(filePath);
    event.sender.startDrag({
      file: filePath,
      icon: './src/assets/logo.png'
    });
  });

  /**
   * Open a particular video file clicked inside Angular
   */
  ipc.on('open-media-file-at-timestamp', (event, executablePath, fullFilePath: string, args: string) => {
    const cmdline: string = `"${path.normalize(executablePath)}" "${path.normalize(fullFilePath)}" ${args}`;
    console.log(cmdline);
    exec(cmdline);
  });

  /**
   * Select default video player
   */
  ipc.on('select-default-video-player', (event) => {
    console.log('asking for default video player');
    dialog.showOpenDialog(win, {
      title: systemMessages.selectDefaultPlayer, // TODO: check if errors out now that this is in `main-ipc.ts`
      filters: [
        {
          name: 'Executable', // TODO: i18n fixme
          extensions: ['exe', 'app']
        }, {
          name: 'All files', // TODO: i18n fixme
          extensions: ['*']
        }
      ],
      properties: ['openFile']
    }).then(result => {
      const executablePath: string = result.filePaths[0];
      if (executablePath) {
        event.sender.send('preferred-video-player-returning', executablePath);
      }
    }).catch(err => {});
  });

  /**
   * Create and play the playlist
   * 1. filter out *FOLDER*
   * 2. save .pls file
   * 3. ask OS to open the .pls file
   */
  ipc.on('please-create-playlist', (event, playlist: ImageElement[], sourceFolderMap: InputSources) => {

    const cleanPlaylist: ImageElement[] = playlist.filter((element: ImageElement) => {
      return element.cleanName !== '*FOLDER*';
    });

    const savePath: string = path.join(GLOBALS.settingsPath, 'temp.pls');

    if (cleanPlaylist.length) {
      createDotPlsFile(savePath, cleanPlaylist, sourceFolderMap, () => {
        shell.openItem(savePath);
        // shell.openPath(savePath); // Electron 9
      });
    }
  });

  /**
   * Delete file from computer (send to recycling bin / trash) or dangerously delete (bypass trash)
   */
  ipc.on('delete-video-file', (event, basePath: string, item: ImageElement, dangerousDelete: boolean): void => {
    const fileToDelete = path.join(basePath, item.partialPath, item.fileName);

    if (dangerousDelete) {
      fs.unlink(fileToDelete, (err) => {
        if (err) {
          console.log(fileToDelete + ' was NOT deleted');
        }
      });
    } else {
      (async () => {
        await trash(fileToDelete);
      })();
    }

    // TODO --   handle async stuff better -- maybe wait before checking access?
    console.log('HANDLE ASYNC STUFF CORRECTLY !?');
    // check if file exists
    fs.access(fileToDelete, fs.constants.F_OK, (err: any) => {
      if (err) {
        event.sender.send('file-deleted', item);
      }
    });

  });

  /**
   * Method to replace thumbnail of a particular item
   */
  ipc.on('replace-thumbnail', (event, pathToIncomingJpg: string, item: ImageElement) => {
    const fileToReplace: string = path.join(
        GLOBALS.selectedOutputFolder,
        'vha-' + GLOBALS.hubName,
        'thumbnails',
        item.hash + '.jpg'
      );

    const height: number = GLOBALS.screenshotSettings.height;

    replaceThumbnailWithNewImage(fileToReplace, pathToIncomingJpg, height)
      .then(success => {
        if (success) {
          event.sender.send('thumbnail-replaced');
        }
      })
      .catch((err) => {});

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
        event.sender.send('input-folder-chosen', inputDirPath);
      }
    }).catch(err => {});
  });

  /**
   * Summon system modal to choose NEW input directory for a now-disconnected folder
   * where all the videos are located
   */
  ipc.on('reconnect-this-folder', (event, inputSource: number) => {
    dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    }).then(result => {
      const inputDirPath: string = result.filePaths[0];
      if (inputDirPath) {
        event.sender.send('old-folder-reconnected', inputSource, inputDirPath);
      }
    }).catch(err => {});
  });

  /**
   * Stop watching a particular folder
   */
  ipc.on('stop-watching-folder', (event, watchedFolderIndex: number) => {
    console.log('stop watching:', watchedFolderIndex);
    closeWatcher(watchedFolderIndex);
  });

  /**
   * Stop watching a particular folder
   */
  ipc.on('start-watching-folder', (event, watchedFolderIndex: string, path: string, persistent: boolean) => {
    // annoyingly it's not a number :     ^^^^^^^^^^^^^^^^^^ -- because object keys are strings :(
    console.log('start watching:', watchedFolderIndex, path, persistent);
    startWatcher(parseInt(watchedFolderIndex, 10), path, persistent);
  });

  /**
   * extract any missing thumbnails
   */
  ipc.on('add-missing-thumbnails', (event, finalArray: ImageElement[], extractClips: boolean) => {
    const screenshotOutputFolder: string = path.join(GLOBALS.selectedOutputFolder, 'vha-' + GLOBALS.hubName);
    extractAnyMissingThumbs(finalArray, screenshotOutputFolder, extractClips);
  });

  /**
   * Remove any thumbnails for files no longer present in the hub
   */
  ipc.on('clean-old-thumbnails', (event, finalArray: ImageElement[]) => {
    const screenshotOutputFolder: string = path.join(GLOBALS.selectedOutputFolder, 'vha-' + GLOBALS.hubName);

    const allHashes: Map<string, 1> = new Map();

    finalArray.forEach((element: ImageElement) => {
      allHashes.set(element.hash, 1);
    });
    removeThumbnailsNotInHub(allHashes, screenshotOutputFolder);
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
        event.sender.send('output-folder-chosen', outputDirPath);
      }
    }).catch(err => {});
  });

  /**
   * Try to rename the particular file
   */
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
      errMsg = 'RIGHTCLICK.errorFileNameExists';
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

    event.sender.send('rename-file-response', index, success, renameTo, file, errMsg);
  });

  /**
   * Close the window / quit / exit the app
   */
  ipc.on('close-window', (event, settingsToSave: SettingsObject, finalObjectToSave: FinalObject) => {

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
    fs.writeFile(path.join(GLOBALS.settingsPath, 'settings.json'), json, 'utf8', () => {
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

}
