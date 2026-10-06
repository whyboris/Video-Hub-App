import { shell } from 'electron';

import * as path from 'path';
const fs = require('fs');
const exec = require('child_process').exec;

import { GLOBALS } from './main-globals';
import type { ExternalPlaylistItem, PlaylistFile, PlaylistLoadStatus } from '../interfaces/playlist.interface';

// files already backed up during this session -- so the `.bak` keeps the state from before the session
const backedUpThisSession: Set<string> = new Set();

// files that failed to parse -- never back these up over a good `.bak`
const unreadableFiles: Set<string> = new Set();

/**
 * `C:/videos/my-hub.vha2` => `C:/videos/my-hub.playlists.json`
 */
export function playlistsPathFor(vhaPath: string): string {
  return vhaPath.replace(/\.vha2$/i, '') + '.playlists.json';
}

/**
 * Read and sanity-check a playlists file; throws if it is missing or malformed
 */
function readPlaylistFile(filePath: string): PlaylistFile {
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!parsed || !Array.isArray(parsed.playlists)) {
    throw new Error('not a playlists file');
  }
  return parsed;
}

/**
 * Write `contents` to `filePath` by writing a temp file and renaming it over the original,
 * so a crash mid-write never leaves a half-written file behind.
 * The first save of a session copies the previous file to `.bak`.
 */
function writeFileAtomically(filePath: string, contents: string): void {
  const tempPath: string = filePath + '.tmp';

  fs.writeFileSync(tempPath, contents, 'utf8');

  if (fs.existsSync(filePath)) {
    if (unreadableFiles.has(filePath)) {
      // keep the broken file for inspection, and leave the good `.bak` alone
      fs.renameSync(filePath, filePath + '.unreadable-' + Date.now());
      unreadableFiles.delete(filePath);
    } else if (!backedUpThisSession.has(filePath)) {
      fs.copyFileSync(filePath, filePath + '.bak');
    }
  }
  backedUpThisSession.add(filePath);

  try {
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    // e.g. antivirus briefly holding the file -- fall back to a direct write
    console.log('rename failed, writing directly', err);
    fs.writeFileSync(filePath, contents, 'utf8');
    try { fs.unlinkSync(tempPath); } catch {}
  }
}

/**
 * Write an `.m3u8` for an external player
 * `#EXTVLCOPT` start/stop times are honored by VLC; other players play whole files
 */
function createM3u8File(savePath: string, name: string, items: ExternalPlaylistItem[]): void {
  const lines: string[] = ['#EXTM3U', '#PLAYLIST:' + name];

  items.forEach((item: ExternalPlaylistItem) => {
    const hasRange: boolean = item.start !== undefined && item.end !== undefined;
    const duration: number = hasRange ? item.end - item.start : item.duration;

    lines.push('#EXTINF:' + Math.round(duration) + ',' + item.title);
    if (hasRange) {
      lines.push('#EXTVLCOPT:start-time=' + item.start.toFixed(3));
      lines.push('#EXTVLCOPT:stop-time=' + item.end.toFixed(3));
    }
    lines.push(item.fullPath);
  });

  lines.push('');

  fs.writeFileSync(savePath, lines.join('\n'), 'utf8');
}

/**
 * Set up the listeners for playlists
 */
export function setUpIpcForPlaylists(ipc): void {

  /**
   * Load the playlists file belonging to a hub
   * Replies with `playlists-returning` (vhaPath, data | null, status)
   */
  ipc.on('please-load-playlists', (event, vhaPath: string): void => {
    const filePath: string = playlistsPathFor(vhaPath);

    let data: PlaylistFile = null;
    let status: PlaylistLoadStatus = '';

    if (fs.existsSync(filePath)) {
      try {
        data = readPlaylistFile(filePath);
        unreadableFiles.delete(filePath);
      } catch (err) {
        console.log('playlists file unreadable', filePath, err);
        unreadableFiles.add(filePath);
        try {
          data = readPlaylistFile(filePath + '.bak');
          status = 'restoredFromBackup';
        } catch {
          status = 'unreadable';
        }
      }
    }

    event.sender.send('playlists-returning', vhaPath, data, status);
  });

  /**
   * Save the playlists file belonging to a hub
   * Synchronous on purpose: when the app closes, this finishes before `close-window` is handled
   * Replies with `playlists-saved` (vhaPath, errorMessage)
   */
  ipc.on('please-save-playlists', (event, vhaPath: string, data: PlaylistFile): void => {
    if (!vhaPath) {
      return;
    }

    let errorMessage = '';

    try {
      writeFileAtomically(playlistsPathFor(vhaPath), JSON.stringify(data, null, 2));
    } catch (err) {
      console.log('could not save playlists', err);
      errorMessage = String(err && err.message ? err.message : err);
    }

    try {
      event.sender.send('playlists-saved', vhaPath, errorMessage);
    } catch {} // window may already be closing
  });

  /**
   * Write an `.m3u8` and open it with the preferred player, or the system default
   */
  ipc.on('please-play-playlist-externally', (event, name: string, items: ExternalPlaylistItem[], execPath: string): void => {
    if (!items || !items.length) {
      return;
    }

    const savePath: string = path.join(GLOBALS.settingsPath, 'temp-playlist.m3u8');

    try {
      createM3u8File(savePath, name, items);
    } catch (err) {
      console.log('could not write playlist file', err);
      return;
    }

    if (execPath) {
      const cmdline = `"${path.normalize(execPath)}" "${path.normalize(savePath)}"`;
      exec(cmdline);
    } else {
      shell.openPath(savePath);
    }
  });

}
