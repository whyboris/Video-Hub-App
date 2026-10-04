import { Injectable, NgZone, signal } from '@angular/core';

import { PlaylistService } from './playlist.service';
import { SourceFolderService } from '../components/statistics/source-folder.service';

import type { ImageElement } from '../../../interfaces/final-object.interface';
import type { Playlist, PlaylistEntry } from '../../../interfaces/playlist.interface';

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerItem {
  key: string;               // entry id, or `video:<hash>` for a single video
  element: ImageElement;
  start?: number;            // seconds -- highlight start
  end?: number;              // seconds -- highlight end
  label?: string;
  entryId?: string;
}

/**
 * State of the built-in player: what is queued, in which order, and what is playing
 * The `PlayerComponent` does the actual playback
 */
@Injectable({ providedIn: 'root' })
export class PlayerService {

  readonly isOpen = signal(false);
  readonly version = signal(0); // bumps on every change so views can recompute

  items: PlayerItem[] = [];
  order: number[] = [];      // play order -- indexes into `items`
  position = 0;              // index into `order`
  shuffle = false;
  repeat: RepeatMode = 'off';
  title = '';                // playlist name, or '' for a single video
  playlistId: string = null;
  startAt: number = undefined; // seconds -- only for the first item (a video opened at a thumbnail)

  // set by `HomeComponent` -- its `settingsButtons` and `appState` objects get replaced at times
  useBuiltIn: () => boolean = () => true;
  openExternally: (element: ImageElement, seconds: number) => void = () => {};

  constructor(
    private playlistService: PlaylistService,
    private sourceFolderService: SourceFolderService,
    private zone: NgZone,
  ) { }

  // ===========================================================================================
  // Starting playback
  // -------------------------------------------------------------------------------------------

  /**
   * Play a playlist in the built-in player, or the external one if the user prefers that
   * @returns number of playable entries -- 0 when nothing could be played
   */
  playPlaylist(playlistId: string, fromEntryId?: string, shuffle?: boolean, forceExternal?: boolean): number {
    if (forceExternal || !this.useBuiltIn()) {
      return this.playlistService.playExternally(playlistId, fromEntryId, shuffle);
    }

    const playlist: Playlist = this.playlistService.get(playlistId);
    if (!playlist) {
      return 0;
    }

    const items: PlayerItem[] = [];
    let startIndex = 0;

    playlist.entries.forEach((entry: PlaylistEntry) => {
      const element: ImageElement = this.playlistService.resolve(entry);
      if (!element || !this.sourceFolderService.sourceFolderConnected[element.inputSource]) {
        return; // missing or offline -- nothing to play
      }
      if (entry.id === fromEntryId) {
        startIndex = items.length;
      }
      const isHighlight: boolean = entry.start !== undefined && entry.end !== undefined;
      items.push({
        key: entry.id,
        element: element,
        entryId: entry.id,
        start: isHighlight ? entry.start : undefined,
        end: isHighlight ? entry.end : undefined,
        label: entry.label,
      });
    });

    if (items.length) {
      this.open(items, playlist.name, playlist.id, startIndex, !!shuffle);
    }
    return items.length;
  }

  /**
   * Play one video from the gallery
   */
  playVideo(element: ImageElement, startAt?: number): void {
    this.open([{ key: 'video:' + element.hash, element: element }], '', null, 0, false, startAt);
  }

  private open(items: PlayerItem[], title: string, playlistId: string, startIndex: number, shuffle: boolean, startAt?: number): void {
    this.items = items;
    this.title = title;
    this.playlistId = playlistId;
    this.startAt = startAt;
    this.shuffle = shuffle;
    this.setOrder(startIndex);
    this.isOpen.set(true);
    this.bump();
  }

  close(): void {
    this.isOpen.set(false);
    this.items = [];
    this.order = [];
    this.bump();
  }

  // ===========================================================================================
  // Moving through the queue
  // -------------------------------------------------------------------------------------------

  current(): PlayerItem {
    return this.items[this.order[this.position]];
  }

  /**
   * What plays after the current item -- used to preload it
   */
  peekNext(): PlayerItem {
    if (this.repeat === 'one') {
      return this.current();
    }
    if (this.position + 1 < this.order.length) {
      return this.items[this.order[this.position + 1]];
    }
    return this.repeat === 'all' ? this.items[this.order[0]] : undefined;
  }

  /**
   * The current item finished on its own -- `repeat one` plays it again
   * @returns false at the end of the queue
   */
  advance(): boolean {
    if (this.repeat === 'one') {
      this.startAt = undefined;
      this.bump();
      return true;
    }
    return this.next();
  }

  /**
   * @returns false at the end of the queue (unless repeating all)
   */
  next(): boolean {
    this.startAt = undefined;
    if (this.position + 1 < this.order.length) {
      this.position++;
    } else if (this.repeat === 'all' && this.order.length) {
      this.position = 0;
    } else {
      return false;
    }
    this.bump();
    return true;
  }

  previous(): boolean {
    this.startAt = undefined;
    if (this.position > 0) {
      this.position--;
    } else if (this.repeat === 'all' && this.order.length) {
      this.position = this.order.length - 1;
    } else {
      return false;
    }
    this.bump();
    return true;
  }

  get hasNext(): boolean {
    return this.position + 1 < this.order.length || (this.repeat === 'all' && this.order.length > 1);
  }

  get hasPrevious(): boolean {
    return this.position > 0 || (this.repeat === 'all' && this.order.length > 1);
  }

  /**
   * Jump to an item from the queue list
   */
  jumpTo(itemIndex: number): void {
    const position: number = this.order.indexOf(itemIndex);
    if (position !== -1) {
      this.startAt = undefined;
      this.position = position;
      this.bump();
    }
  }

  /**
   * Restart from the first item, e.g. after reaching the end
   */
  restart(): void {
    this.startAt = undefined;
    this.position = 0;
    this.bump();
  }

  toggleShuffle(): void {
    this.shuffle = !this.shuffle;
    this.setOrder(this.order[this.position]);
    this.bump();
  }

  cycleRepeat(): void {
    this.repeat = this.repeat === 'off' ? 'all' : (this.repeat === 'all' ? 'one' : 'off');
    this.bump();
  }

  /**
   * Set the play order with `currentIndex` playing now
   * - in order: the playlist order, so Previous still reaches earlier items
   * - shuffled: `currentIndex` first, then the rest in random order
   */
  private setOrder(currentIndex: number): void {
    const all: number[] = this.items.map((_, i: number) => i);
    if (!this.shuffle) {
      this.order = all;
      this.position = Math.max(0, currentIndex);
      return;
    }
    const rest: number[] = all.filter((i: number) => i !== currentIndex);
    for (let i = rest.length - 1; i > 0; i--) {
      const j: number = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    this.order = [currentIndex, ...rest];
    this.position = 0;
  }

  private bump(): void {
    this.version.update(value => value + 1);
    if (!NgZone.isInAngularZone()) {
      this.zone.run(() => {});
    }
  }

}
