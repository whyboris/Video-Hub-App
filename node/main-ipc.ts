import { app, dialog, shell, BrowserWindow } from 'electron';

import * as path from 'path';
const fs = require('fs');
const trash = require('trash');
const exec = require('child_process').exec;

import { GLOBALS } from './main-globals';
import { ImageElement, FinalObject, InputSources } from '../interfaces/final-object.interface';
import { SettingsObject } from '../interfaces/settings-object.interface';
import { createDotPlsFile, writeVhaFileToDisk, editPlaylist, removeItemFromPlaylist } from './main-support';
import { replaceThumbnailWithNewImage } from './main-extract';
import { closeWatcher, startWatcher, extractAnyMissingThumbs, removeThumbnailsNotInHub } from './main-extract-async';

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
    fs.access(fullFilePath, fs.constants.F_OK, (err: any) => {
      if (!err) {
        shell.openPath(path.normalize(fullFilePath));
      } else {
        event.sender.send('file-not-found');
      }
    });
  });

  /**
   * Open a particular video file clicked inside Angular at particular timestamp
   */
  ipc.on('open-media-file-at-timestamp', (event, executablePath, fullFilePath: string, args: string) => {
    fs.access(fullFilePath, fs.constants.F_OK, (err: any) => {
      if (!err) {
        const cmdline: string = `"${path.normalize(executablePath)}" "${path.normalize(fullFilePath)}" ${args}`;
        console.log(cmdline);
        exec(cmdline);
      } else {
        event.sender.send('file-not-found');
      }
    });
  });

  /**
   * Handle dragging a file out of VHA into a video editor (e.g. Vegas or Premiere)
   * if `imgPath` points to a file that does not exist, replace with default image
   */
  ipc.on('drag-video-out-of-electron', (event, filePath, imgPath): void => {
    fs.access(imgPath, fs.constants.F_OK, (err: any) => {
      if (!err) {
        event.sender.startDrag({
          file: filePath,
          icon: imgPath,
        });
      } else {
        const tempIcon: string = app.isPackaged ? './resources/assets/logo.png' : './src/assets/logo.png';
        event.sender.startDrag({
          file: filePath,
          icon: tempIcon,
        });
      }
    });
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
  ipc.on('please-create-playlist', (event, playlist: ImageElement[], sourceFolderMap: InputSources, execPath: string) => {

    const cleanPlaylist: ImageElement[] = playlist.filter((element: ImageElement) => {
      return element.cleanName !== '*FOLDER*';
    });

    const savePath: string = path.join(GLOBALS.settingsPath, 'temp.pls');

    if (cleanPlaylist.length) {
      createDotPlsFile(savePath, cleanPlaylist, sourceFolderMap, () => {

        if (execPath) { // if `preferredVideoPlayer` is sent
          const cmdline: string = `"${path.normalize(execPath)}" "${path.normalize(savePath)}"`;
          console.log(cmdline);
          exec(cmdline);
        } else {
          shell.openPath(savePath);
        }
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
          console.log('ERROR:', fileToDelete + ' was NOT deleted');
        } else {
          notifyFileDeleted(event, fileToDelete, item);
        }
      });

    } else {

      (async () => {
        await trash(fileToDelete);
        notifyFileDeleted(event, fileToDelete, item);
      })();

    }
  });

  /**
   * Helper function for `delete-video-file`
   * @param event
   * @param fileToDelete
   * @param item
   */
  function notifyFileDeleted(event, fileToDelete, item) {
    fs.access(fileToDelete, fs.constants.F_OK, (err: any) => {
      if (err) {
        console.log('FILE DELETED SUCCESS !!!');
        event.sender.send('file-deleted', item);
      }
    });
  }

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
  ipc.on('start-watching-folder', (event, watchedFolderIndex: string, path2: string, persistent: boolean) => {
    // annoyingly it's not a number :     ^^^^^^^^^^^^^^^^^^ -- because object keys are strings :(
    console.log('start watching:', watchedFolderIndex, path2, persistent);
    startWatcher(parseInt(watchedFolderIndex, 10), path2, persistent);
  });

  /**
   * extract any missing thumbnails
   */
  ipc.on('add-missing-thumbnails', (event, finalArray: ImageElement[], extractClips: boolean) => {
    extractAnyMissingThumbs(finalArray);
  });

  /**
   * Remove any thumbnails for files no longer present in the hub
   */
  ipc.on('clean-old-thumbnails', (event, finalArray: ImageElement[]) => {
    // !!! WARNING
    const screenshotOutputFolder: string = path.join(GLOBALS.selectedOutputFolder, 'vha-' + GLOBALS.hubName);
    // !! ^^^^^^^^^^^^^^^^^^^^^^ - make sure this points to the folder with screenshots only!

    const allHashes: Map<string, 1> = new Map();

    finalArray
      .filter((element: ImageElement) => { return !element.deleted; })
      .forEach((element: ImageElement) => {
        allHashes.set(element.hash, 1);
      });
    removeThumbnailsNotInHub(allHashes, screenshotOutputFolder); // WARNING !!! this function will delete stuff
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
    settingsToSave.shortcuts = <any>Object.fromEntries(settingsToSave.shortcuts);

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
            GLOBALS.readyToQuit = true;
            BrowserWindow.getFocusedWindow().close();
          } catch {}
        });

      } else {
        try {
          GLOBALS.readyToQuit = true;
          BrowserWindow.getFocusedWindow().close();
        } catch {}
      }
    });
  });

  /**
   * Read a .pls file and send its content back to the renderer process
   */
  ipc.on('read-pls-file', (event, filePath: string) => {
    try {
      const plsPath: string = path.join(GLOBALS.settingsPath, filePath);

      if (!fs.existsSync(plsPath)) {
        event.sender.send('pls-file-content', []);
        return;
      }

      const content = fs.readFileSync(plsPath, 'utf8');
      const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
      const entries = [];

      // Check if file has minimum required structure
      if (lines.length < 2) {
        event.sender.send('pls-file-content', []);
        return;
      }

      // Skip the [playlist] header
      let i = 1;

      // Get number of entries - add safety check
      if (i >= lines.length || !lines[i] || !lines[i].includes('=')) {
        event.sender.send('pls-file-content', []);
        return;
      }

      const numEntriesLine = lines[i].split('=');
      if (numEntriesLine.length < 2) {
        event.sender.send('pls-file-content', []);
        return;
      }

      const numEntries = parseInt(numEntriesLine[1]);
      if (isNaN(numEntries) || numEntries < 0) {
        event.sender.send('pls-file-content', []);
        return;
      }

      i++;

      // Parse each entry
      for (let j = 0; j < numEntries; j++) {
        const fileLine = lines[i];
        const titleLine = lines[i + 1];

        if (fileLine && titleLine && fileLine.includes('=') && titleLine.includes('=')) {
          const fileParts = fileLine.split('=');
          const titleParts = titleLine.split('=');

          if (fileParts.length >= 2 && titleParts.length >= 2) {
            const file = fileParts.slice(1).join('=');
            const title = titleParts.slice(1).join('=');

            entries.push({
              file: file,
              title: title
            } as never);
          }
        }

        i += 2; // Move to next entry

        // Safety check to prevent going out of bounds
        if (i >= lines.length) {
          break;
        }
      }
      event.sender.send('pls-file-content', entries);
    } catch (error) {
      console.error('Error reading .pls file:', error);
      event.sender.send('pls-file-content', []);
    }
  });

  /**
   * Add the current video to the playlist
   */
  ipc.on('please-add-to-playlist', (event, item: ImageElement, sourceFolderMap: InputSources) => {

    const savePath: string = path.join(GLOBALS.settingsPath, 'temp.pls');

    editPlaylist(savePath, item, sourceFolderMap);
  });

  /**
   * Remove the current video from the playlist
   */
  ipc.on('please-remove-from-playlist', (event, item: ImageElement) => {
    const savePath: string = path.join(GLOBALS.settingsPath, 'temp.pls');

    removeItemFromPlaylist(savePath, item);
  });
}
