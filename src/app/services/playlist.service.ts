import { Injectable, NgZone, signal } from '@angular/core';

import { FilePathService } from '../components/views/file-path.service';
import { ImageElementService } from './image-element.service';
import { SourceFolderService } from '../components/statistics/source-folder.service';

import type { ImageElement } from '../../../interfaces/final-object.interface';
import type {
  ExternalPlaylistItem,
  HighlightRef,
  Playlist,
  PlaylistEntry,
  PlaylistFile,
  PlaylistKind,
  PlaylistLoadStatus
} from '../../../interfaces/playlist.interface';

const SAVE_DELAY_MS = 2000;

export interface EntryRange {
  start: number;
  end: number;
  label?: string;
}

/**
 * Named playlists & compilations for the currently open hub
 * Persisted by node in `<hubName>.playlists.json` (see `node/main-playlists.ts`)
 */
@Injectable({ providedIn: 'root' })
export class PlaylistService {

  playlists: Playlist[] = [];

  openPlaylistId: string = null;     // playlist shown in place of the gallery
  lastUsedPlaylistId: string = null; // target of the thumbnail playlist icon
  highlightTargetId: string = null;  // where highlights marked in the player go

  // set by `HomeComponent` -- its `appState` object is replaced when settings load, so it is read through this
  preferredPlayer: () => string = () => '';

  // bumps on every change so views can recompute
  readonly version = signal(0);

  // set when the playlists file could not be read -- show a message and never overwrite it
  readonly loadProblem = signal<PlaylistLoadStatus>('');
  readonly saveError = signal('');

  private vhaPath = '';
  private hubName = '';
  private loaded = false;
  private savingBlocked = false;

  private saveTimeout: any = null;
  private dirty = false;

  // lookup tables -- rebuilt when `imageElements` changes
  private indexedArray: ImageElement[] = null;
  private indexedLength = -1;
  private byHash: Map<string, ImageElement> = new Map();
  private byPath: Map<string, ImageElement> = new Map();

  // legacy (single, unnamed) playlist from the `.vha2` -- migrated when the hub has no playlists file
  private legacyCandidates: ImageElement[] = [];

  constructor(
    private filePathService: FilePathService,
    private imageElementService: ImageElementService,
    private sourceFolderService: SourceFolderService,
    private zone: NgZone,
  ) {
    (window as any).myElectron.receiveFromMain('playlists-returning', (
      vhaPath: string,
      data: PlaylistFile,
      status: PlaylistLoadStatus
    ) => {
      this.zone.run(() => this.playlistsReturned(vhaPath, data, status));
    });

    (window as any).myElectron.receiveFromMain('playlists-saved', (vhaPath: string, errorMessage: string) => {
      this.zone.run(() => {
        if (vhaPath === this.vhaPath) {
          this.saveError.set(errorMessage);
        }
      });
    });
  }

  // ===========================================================================================
  // Loading & saving
  // -------------------------------------------------------------------------------------------

  /**
   * Called whenever a hub finishes loading
   * @param vhaPath  full path to the `.vha2` file
   * @param hubName
   * @param images   used only to migrate the legacy single playlist
   */
  loadForHub(vhaPath: string, hubName: string, images: ImageElement[]): void {
    this.flush(); // just in case -- should already have happened before the hub switched

    clearTimeout(this.saveTimeout);
    this.vhaPath = vhaPath;
    this.hubName = hubName;
    this.playlists = [];
    this.openPlaylistId = null;
    this.lastUsedPlaylistId = null;
    this.highlightTargetId = null;
    this.loaded = false;
    this.savingBlocked = false;
    this.dirty = false;
    this.loadProblem.set('');
    this.saveError.set('');
    this.indexedArray = null;

    this.legacyCandidates = images
      .filter((element: ImageElement) => element.playlist)
      .sort((a: ImageElement, b: ImageElement) => a.playlist - b.playlist);

    this.bump();

    (window as any).myElectron.sendToMain('please-load-playlists', vhaPath);
  }

  private playlistsReturned(vhaPath: string, data: PlaylistFile, status: PlaylistLoadStatus): void {
    if (vhaPath !== this.vhaPath) {
      return; // user already switched to another hub
    }

    this.loadProblem.set(status);

    if (status === 'unreadable') {
      this.savingBlocked = true;
    } else if (data) {
      this.playlists = data.playlists;
      this.lastUsedPlaylistId = data.lastUsedPlaylistId || null;
      this.highlightTargetId = data.highlightTargetId || null;
      if (status === 'restoredFromBackup') {
        this.dirty = true;
      }
    } else if (this.legacyCandidates.length) {
      const migrated: Playlist = this.newPlaylistObject('Playlist', 'playlist');
      migrated.entries = this.legacyCandidates.map((element: ImageElement) => this.newEntry(element));
      this.playlists = [migrated];
      this.lastUsedPlaylistId = migrated.id;
      this.dirty = true;
    }

    this.legacyCandidates = [];
    this.loaded = true;

    if (this.dirty) {
      this.scheduleSave();
    }
    this.bump();
  }

  /**
   * Whether playlists can be changed right now
   */
  get ready(): boolean {
    return this.loaded && !this.savingBlocked;
  }

  /**
   * Save immediately if anything changed -- call before closing the app or switching hubs
   */
  flush(): void {
    clearTimeout(this.saveTimeout);

    if (!this.dirty || !this.loaded || this.savingBlocked || !this.vhaPath) {
      return;
    }

    const data: PlaylistFile = {
      version: 1,
      hubName: this.hubName,
      lastUsedPlaylistId: this.lastUsedPlaylistId || undefined,
      highlightTargetId: this.highlightTargetId || undefined,
      playlists: this.playlists,
    };

    (window as any).myElectron.sendToMain('please-save-playlists', this.vhaPath, data);
    this.dirty = false;
  }

  private changed(playlist?: Playlist): void {
    if (playlist) {
      playlist.modified = Date.now();
    }
    this.dirty = true;
    this.scheduleSave();
    this.bump();
  }

  private scheduleSave(): void {
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => this.flush(), SAVE_DELAY_MS);
  }

  private bump(): void {
    this.version.update(value => value + 1);
    if (!NgZone.isInAngularZone()) {
      // changes made from outside Angular (e.g. IPC callbacks) still refresh the screen
      this.zone.run(() => {});
    }
  }

  // ===========================================================================================
  // Playlists
  // -------------------------------------------------------------------------------------------

  get(playlistId: string): Playlist {
    return this.playlists.find((playlist: Playlist) => playlist.id === playlistId);
  }

  get openPlaylist(): Playlist {
    return this.openPlaylistId ? this.get(this.openPlaylistId) : undefined;
  }

  get lastUsedPlaylist(): Playlist {
    return this.lastUsedPlaylistId ? this.get(this.lastUsedPlaylistId) : undefined;
  }

  open(playlistId: string): void {
    this.openPlaylistId = playlistId;
    this.bump();
  }

  close(): void {
    this.openPlaylistId = null;
    this.bump();
  }

  create(name: string, kind: PlaylistKind): Playlist {
    if (!this.ready) {
      return undefined;
    }
    const playlist: Playlist = this.newPlaylistObject(this.uniqueName(name), kind);
    this.playlists.push(playlist);
    this.lastUsedPlaylistId = playlist.id;
    this.changed();
    return playlist;
  }

  rename(playlistId: string, newName: string): void {
    const playlist: Playlist = this.get(playlistId);
    const trimmed: string = (newName || '').trim();
    if (!this.ready || !playlist || !trimmed || trimmed === playlist.name) {
      return;
    }
    playlist.name = trimmed;
    this.changed(playlist);
  }

  duplicate(playlistId: string): Playlist {
    const original: Playlist = this.get(playlistId);
    if (!this.ready || !original) {
      return undefined;
    }
    const copy: Playlist = this.newPlaylistObject(this.uniqueName(original.name), original.kind);
    copy.entries = original.entries.map((entry: PlaylistEntry) => ({ ...entry, id: this.uuid() }));
    this.playlists.splice(this.playlists.indexOf(original) + 1, 0, copy);
    this.changed();
    return copy;
  }

  delete(playlistId: string): void {
    const index: number = this.playlists.findIndex((playlist: Playlist) => playlist.id === playlistId);
    if (!this.ready || index === -1) {
      return;
    }
    this.playlists.splice(index, 1);
    if (this.openPlaylistId === playlistId) {
      this.openPlaylistId = null;
    }
    if (this.lastUsedPlaylistId === playlistId) {
      this.lastUsedPlaylistId = null;
    }
    if (this.highlightTargetId === playlistId) {
      this.highlightTargetId = null;
    }
    this.changed();
  }

  /**
   * Move a playlist in the sidebar list to just before another one (or to the end)
   */
  reorderPlaylist(playlistId: string, beforePlaylistId: string | null): void {
    const playlist: Playlist = this.get(playlistId);
    if (!this.ready || !playlist || playlistId === beforePlaylistId) {
      return;
    }
    this.playlists.splice(this.playlists.indexOf(playlist), 1);
    const target: number = beforePlaylistId
      ? this.playlists.findIndex((p: Playlist) => p.id === beforePlaylistId)
      : -1;
    this.playlists.splice(target === -1 ? this.playlists.length : target, 0, playlist);
    this.changed();
  }

  // ===========================================================================================
  // Entries
  // -------------------------------------------------------------------------------------------

  /**
   * Add videos (whole) or one highlight to a playlist
   * Whole videos already in the playlist are skipped, highlights never are
   * @returns number of entries added
   */
  addVideos(playlistId: string, elements: ImageElement[], range?: EntryRange): number {
    const playlist: Playlist = this.get(playlistId);
    if (!this.ready || !playlist) {
      return 0;
    }

    const videos: ImageElement[] = elements.filter((element: ImageElement) => element && element.cleanName !== '*FOLDER*');

    let added = 0;
    videos.forEach((element: ImageElement) => {
      if (!range && this.containsWholeVideo(playlist, element.hash)) {
        return;
      }
      playlist.entries.push(this.newEntry(element, range));
      added++;
    });

    this.lastUsedPlaylistId = playlist.id;
    this.changed(playlist);
    return added;
  }

  removeEntries(playlistId: string, entryIds: string[]): void {
    const playlist: Playlist = this.get(playlistId);
    if (!this.ready || !playlist) {
      return;
    }
    playlist.entries = playlist.entries.filter((entry: PlaylistEntry) => !entryIds.includes(entry.id));
    this.changed(playlist);
  }

  /**
   * Move or copy entries into another playlist (appended at the end)
   * When copying, whole videos already in the target are skipped
   */
  transferEntries(fromId: string, toId: string, entryIds: string[], copy: boolean): number {
    const from: Playlist = this.get(fromId);
    const to: Playlist = this.get(toId);
    if (!this.ready || !from || !to || fromId === toId) {
      return 0;
    }

    const toTransfer: PlaylistEntry[] = from.entries.filter((entry: PlaylistEntry) => entryIds.includes(entry.id));

    let transferred = 0;
    toTransfer.forEach((entry: PlaylistEntry) => {
      const isWholeVideo: boolean = entry.start === undefined;
      if (isWholeVideo && this.containsWholeVideo(to, entry.hash)) {
        return; // already there -- not added twice, but a move still removes it from the source below
      }
      to.entries.push({ ...entry, id: this.uuid(), added: Date.now() });
      transferred++;
    });

    if (!copy) {
      from.entries = from.entries.filter((entry: PlaylistEntry) => !entryIds.includes(entry.id));
      from.modified = Date.now();
    }

    this.lastUsedPlaylistId = to.id;
    this.changed(to);
    return transferred;
  }

  /**
   * Move a set of entries (keeping their relative order) to just before another entry, or to the end
   */
  reorderEntries(playlistId: string, entryIds: string[], beforeEntryId: string | null): void {
    const playlist: Playlist = this.get(playlistId);
    if (!this.ready || !playlist || entryIds.includes(beforeEntryId)) {
      return;
    }

    const moving: PlaylistEntry[] = playlist.entries.filter((entry: PlaylistEntry) => entryIds.includes(entry.id));
    const rest: PlaylistEntry[] = playlist.entries.filter((entry: PlaylistEntry) => !entryIds.includes(entry.id));

    const target: number = beforeEntryId ? rest.findIndex((entry: PlaylistEntry) => entry.id === beforeEntryId) : -1;
    rest.splice(target === -1 ? rest.length : target, 0, ...moving);

    playlist.entries = rest;
    this.changed(playlist);
  }

  /**
   * Thumbnail playlist icon -- add to or remove from the last used playlist (creating "Playlist" if needed)
   */
  toggleInLastUsed(element: ImageElement): void {
    if (!this.ready) {
      return;
    }

    let playlist: Playlist = this.lastUsedPlaylist;
    if (!playlist) {
      playlist = this.playlists.find((p: Playlist) => p.kind === 'playlist') || this.create('Playlist', 'playlist');
    }

    if (this.containsWholeVideo(playlist, element.hash)) {
      playlist.entries = playlist.entries.filter((entry: PlaylistEntry) => !(entry.hash === element.hash && entry.start === undefined));
      this.lastUsedPlaylistId = playlist.id;
      this.changed(playlist);
    } else {
      this.addVideos(playlist.id, [element]);
    }
  }

  // ===========================================================================================
  // Highlights
  // -------------------------------------------------------------------------------------------

  get highlightTarget(): Playlist {
    return this.highlightTargetId ? this.get(this.highlightTargetId) : undefined;
  }

  setHighlightTarget(playlistId: string): void {
    if (this.ready && this.get(playlistId) && this.highlightTargetId !== playlistId) {
      this.highlightTargetId = playlistId;
      this.changed();
    }
  }

  /**
   * All highlights of one video, in every playlist and compilation, earliest first
   */
  highlightsFor(hash: string): HighlightRef[] {
    const found: HighlightRef[] = [];
    this.playlists.forEach((playlist: Playlist) => {
      playlist.entries.forEach((entry: PlaylistEntry) => {
        if (entry.hash === hash && entry.start !== undefined && entry.end !== undefined) {
          found.push({ playlist: playlist, entry: entry });
        }
      });
    });
    return found.sort((a: HighlightRef, b: HighlightRef) => a.entry.start - b.entry.start);
  }

  /**
   * Change a highlight's range and/or label -- an empty label removes it
   */
  updateEntry(playlistId: string, entryId: string, changes: { start?: number, end?: number, label?: string }): void {
    const playlist: Playlist = this.get(playlistId);
    const entry: PlaylistEntry = playlist && playlist.entries.find((e: PlaylistEntry) => e.id === entryId);
    if (!this.ready || !entry) {
      return;
    }
    if (changes.start !== undefined && changes.end !== undefined) {
      entry.start = Math.round(changes.start * 1000) / 1000;
      entry.end = Math.round(changes.end * 1000) / 1000;
    }
    if (changes.label !== undefined) {
      const label: string = changes.label.trim();
      if (label) {
        entry.label = label;
      } else {
        delete entry.label;
      }
    }
    this.changed(playlist);
  }

  isInLastUsed(hash: string): boolean {
    const playlist: Playlist = this.lastUsedPlaylist;
    return !!playlist && this.containsWholeVideo(playlist, hash);
  }

  containsWholeVideo(playlist: Playlist, hash: string): boolean {
    return playlist.entries.some((entry: PlaylistEntry) => entry.hash === hash && entry.start === undefined);
  }

  // ===========================================================================================
  // Resolving entries to videos
  // -------------------------------------------------------------------------------------------

  /**
   * Find the video an entry points to; `undefined` if missing from the hub
   * Re-links the entry by path when the hash changed (file edited)
   */
  resolve(entry: PlaylistEntry): ImageElement {
    this.ensureIndex();

    let element: ImageElement = this.byHash.get(entry.hash);

    if (!element || element.deleted) {
      element = this.byPath.get(this.pathKey(entry.inputSource, entry.partialPath, entry.fileName));
      if (!element || element.deleted) {
        return undefined;
      }
      entry.hash = element.hash; // re-link
      this.dirty = true;
      this.scheduleSave();
    }

    // keep the re-link hints current (e.g. after a rename inside the app) -- saved with the next save
    entry.fileName = element.fileName;
    entry.partialPath = element.partialPath;
    entry.inputSource = element.inputSource;

    return element;
  }

  entryDuration(entry: PlaylistEntry, element?: ImageElement): number {
    if (entry.start !== undefined && entry.end !== undefined) {
      return entry.end - entry.start;
    }
    const video: ImageElement = element || this.resolve(entry);
    return video ? video.duration : 0;
  }

  playlistDuration(playlist: Playlist): number {
    return playlist.entries.reduce((total: number, entry: PlaylistEntry) => total + this.entryDuration(entry), 0);
  }

  /**
   * Build the list for an external player -- skips missing videos and disconnected folders
   */
  externalItems(playlist: Playlist, fromEntryId?: string, shuffle?: boolean): ExternalPlaylistItem[] {
    let entries: PlaylistEntry[] = playlist.entries;

    if (fromEntryId) {
      const start: number = entries.findIndex((entry: PlaylistEntry) => entry.id === fromEntryId);
      entries = entries.slice(Math.max(start, 0));
    }

    const items: ExternalPlaylistItem[] = [];

    entries.forEach((entry: PlaylistEntry) => {
      const element: ImageElement = this.resolve(entry);
      if (!element || !this.sourceFolderService.sourceFolderConnected[element.inputSource]) {
        return;
      }
      items.push({
        duration: element.duration,
        end: entry.end,
        fullPath: this.filePathService.getPathFromImageElement(element),
        start: entry.start,
        title: entry.label || element.cleanName,
      });
    });

    if (shuffle) {
      for (let i = items.length - 1; i > 0; i--) {
        const j: number = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
    }

    return items;
  }

  /**
   * Open the playlist in the preferred external player (or the system default) as an `.m3u8`
   * @returns number of entries sent -- 0 when nothing playable
   */
  playExternally(playlistId: string, fromEntryId?: string, shuffle?: boolean): number {
    const playlist: Playlist = this.get(playlistId);
    if (!playlist) {
      return 0;
    }
    const items: ExternalPlaylistItem[] = this.externalItems(playlist, fromEntryId, shuffle);
    if (items.length) {
      (window as any).myElectron.sendToMain('please-play-playlist-externally', playlist.name, items, this.preferredPlayer());
    }
    return items.length;
  }

  private ensureIndex(): void {
    const images: ImageElement[] = this.imageElementService.imageElements;

    if (images === this.indexedArray && images.length === this.indexedLength) {
      return;
    }

    this.byHash = new Map();
    this.byPath = new Map();

    images.forEach((element: ImageElement) => {
      if (element.deleted) {
        return;
      }
      if (!this.byHash.has(element.hash)) {
        this.byHash.set(element.hash, element);
      }
      this.byPath.set(this.pathKey(element.inputSource, element.partialPath, element.fileName), element);
    });

    this.indexedArray = images;
    this.indexedLength = images.length;
  }

  private pathKey(inputSource: number, partialPath: string, fileName: string): string {
    return inputSource + '|' + partialPath + '|' + fileName;
  }

  // ===========================================================================================
  // Helpers
  // -------------------------------------------------------------------------------------------

  private newPlaylistObject(name: string, kind: PlaylistKind): Playlist {
    const now: number = Date.now();
    return {
      id: this.uuid(),
      name: name,
      kind: kind,
      created: now,
      modified: now,
      entries: [],
    };
  }

  private newEntry(element: ImageElement, range?: EntryRange): PlaylistEntry {
    const entry: PlaylistEntry = {
      id: this.uuid(),
      hash: element.hash,
      added: Date.now(),
      fileName: element.fileName,
      partialPath: element.partialPath,
      inputSource: element.inputSource,
    };
    if (range) {
      entry.start = range.start;
      entry.end = range.end;
      if (range.label) {
        entry.label = range.label;
      }
    }
    return entry;
  }

  /**
   * `Summer` => `Summer 2` if a playlist called `Summer` exists
   */
  private uniqueName(name: string): string {
    const base: string = (name || '').trim() || 'Playlist';
    const taken: Set<string> = new Set(this.playlists.map((playlist: Playlist) => playlist.name.toLowerCase()));
    if (!taken.has(base.toLowerCase())) {
      return base;
    }
    let n = 2;
    while (taken.has((base + ' ' + n).toLowerCase())) {
      n++;
    }
    return base + ' ' + n;
  }

  private uuid(): string {
    try {
      return crypto.randomUUID();
    } catch {
      return Date.now().toString(36) + Math.random().toString(36).slice(2);
    }
  }

}
