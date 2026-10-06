import type { ElementRef } from '@angular/core';
import { Component, input, viewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ExportService } from '../../services/export.service';
import { FilePathService } from '../views/file-path.service';
import { ImageElementService } from '../../services/image-element.service';
import { ModalService } from '../modal/modal.service';
import { PlayerService } from '../../services/player.service';
import { PlaylistService } from '../../services/playlist.service';
import { SourceFolderService } from '../statistics/source-folder.service';

import type { ContextMenuCoordinate } from '../../../../interfaces/shared-interfaces';
import type { ImageElement } from '../../../../interfaces/final-object.interface';
import type { Playlist, PlaylistEntry } from '../../../../interfaces/playlist.interface';
import type { PlaylistPickerMode } from './playlist-picker.component';

import { DRAG_ENTRIES, formatDuration, hasDragType } from './playlist-utils';
import type { DraggedEntries } from './playlist-utils';

export interface PlaylistRow {
  entry: PlaylistEntry;
  element: ImageElement;     // undefined when missing from the hub
  number: number;            // 1-based position
  title: string;
  folder: string;
  timing: string;            // `1:12 – 1:31` for highlights, duration for whole videos
  isHighlight: boolean;
  missing: boolean;
  offline: boolean;
  thumbnail: string;         // thumbnail for whole videos; filmstrip for highlights
  frame: number;             // which filmstrip frame to show
  screens: number;           // frames in the filmstrip
}

/**
 * Shows the entries of the open playlist in place of the gallery
 * - click / Ctrl+click / Shift+click to select; Delete removes; Ctrl+A selects all
 * - drag rows to reorder; drag onto a playlist in the sidebar to move (Ctrl to copy)
 * - double-click plays from that row
 */
@Component({
  standalone: false,
  selector: 'app-playlist-view',
  templateUrl: './playlist-view.component.html',
  styleUrls: ['./playlist-view.component.scss'],
  host: {
    'tabindex': '0',
    '(keydown)': 'onKey($event)',
  }
})
export class PlaylistViewComponent {

  readonly renameInput = viewChild<ElementRef>('renameInput');
  readonly labelInput = viewChild<ElementRef>('labelInput');

  readonly darkMode = input<boolean>(false);
  readonly hubName = input<string>('');
  readonly outputFolder = input<string>('');

  selected: Set<string> = new Set();
  private anchorId: string = null; // for Shift+click ranges

  dropBeforeId: string = null;     // drop indicator: before this row
  dropAtEnd = false;               // drop indicator: after the last row
  private dragging = false;

  menuRow: PlaylistRow = null;
  menuPosition: ContextMenuCoordinate = { x: 0, y: 0 };

  pickerMode: PlaylistPickerMode = null;
  pickerPosition: ContextMenuCoordinate = { x: 0, y: 0 };

  renaming = false;
  renameValue = '';

  labelingEntryId: string = null;  // highlight whose label is being edited in its row
  labelValue = '';

  // rows are cached -- rebuilt only when the playlist or the hub's videos change
  private cachedRows: PlaylistRow[] = [];
  private cachedFor = '';
  private cachedImages: ImageElement[] = null;
  private cachedImagesLength = -1;
  private shownPlaylistId: string = null;

  formatDuration = formatDuration;

  constructor(
    public exportService: ExportService,
    public filePathService: FilePathService,
    public imageElementService: ImageElementService,
    public modalService: ModalService,
    public playerService: PlayerService,
    public playlistService: PlaylistService,
    public sourceFolderService: SourceFolderService,
    public translate: TranslateService,
  ) { }

  playlist(): Playlist {
    this.playlistService.version(); // re-evaluate on change
    const playlist: Playlist = this.playlistService.openPlaylist;
    if (playlist && playlist.id !== this.shownPlaylistId) {
      // switched to another playlist -- reset local state
      this.shownPlaylistId = playlist.id;
      this.selected = new Set();
      this.anchorId = null;
      this.renaming = false;
    }
    return playlist;
  }

  rows(): PlaylistRow[] {
    const playlist: Playlist = this.playlist();
    if (!playlist) {
      return [];
    }

    const images: ImageElement[] = this.imageElementService.imageElements;
    // folders connect a moment after the hub loads, so their state is part of the key
    const connected: string = JSON.stringify(this.sourceFolderService.sourceFolderConnected);
    const key: string = playlist.id + ':' + this.playlistService.version() + ':' + connected;

    if (key !== this.cachedFor || images !== this.cachedImages || images.length !== this.cachedImagesLength) {
      this.cachedRows = playlist.entries.map((entry: PlaylistEntry, i: number) => this.buildRow(entry, i));
      this.cachedFor = key;
      this.cachedImages = images;
      this.cachedImagesLength = images.length;
    }

    return this.cachedRows;
  }

  countKey(playlist: Playlist): string {
    const one: boolean = playlist.entries.length === 1;
    return playlist.kind === 'compilation'
      ? (one ? 'PLAYLISTS.countClip' : 'PLAYLISTS.countClips')
      : (one ? 'PLAYLISTS.countVideo' : 'PLAYLISTS.countVideos');
  }

  totalDuration(): string {
    const playlist: Playlist = this.playlist();
    return playlist ? formatDuration(this.playlistService.playlistDuration(playlist)) : '';
  }

  private buildRow(entry: PlaylistEntry, i: number): PlaylistRow {
    const element: ImageElement = this.playlistService.resolve(entry);
    const isHighlight: boolean = entry.start !== undefined && entry.end !== undefined;

    const row: PlaylistRow = {
      entry: entry,
      element: element,
      number: i + 1,
      title: entry.label || (element ? element.cleanName : entry.fileName),
      folder: element ? element.partialPath : entry.partialPath,
      timing: isHighlight
        ? formatDuration(entry.start) + ' – ' + formatDuration(entry.end)
        : (element ? formatDuration(element.duration) : ''),
      isHighlight: isHighlight,
      missing: !element,
      offline: !!element && !this.sourceFolderService.sourceFolderConnected[element.inputSource],
      thumbnail: '',
      frame: 0,
      screens: 1,
    };

    if (element) {
      if (isHighlight && element.screens > 0) {
        // screenshots are taken at duration / (screens + 1) * (n + 1)
        const step: number = element.duration / (element.screens + 1);
        row.frame = Math.min(element.screens - 1, Math.max(0, Math.round(entry.start / step) - 1));
        row.screens = element.screens;
        row.thumbnail = this.filePathService.createFilePath(this.outputFolder(), this.hubName(), 'filmstrips', element.hash);
      } else {
        row.thumbnail = this.filePathService.createFilePath(this.outputFolder(), this.hubName(), 'thumbnails', element.hash);
      }
    }

    return row;
  }

  // ---------------------------------------------------------------- header actions

  play(fromEntryId?: string, shuffle?: boolean, external?: boolean): void {
    if (!this.playerService.playPlaylist(this.playlist().id, fromEntryId, shuffle, external)) {
      this.modalService.openSnackbar(this.translate.instant('PLAYLISTS.nothingToPlay'), 2500);
    }
  }

  close(): void {
    this.playlistService.close();
  }

  startRenaming(): void {
    this.renaming = true;
    this.renameValue = this.playlist().name;
    setTimeout(() => this.renameInput()?.nativeElement.select(), 0);
  }

  renameKey(event: KeyboardEvent): void {
    event.stopPropagation();
    if (event.key === 'Enter') {
      this.finishRenaming();
    } else if (event.key === 'Escape') {
      this.renaming = false;
    }
  }

  finishRenaming(): void {
    if (this.renaming) {
      this.playlistService.rename(this.playlist().id, this.renameValue);
      this.renaming = false;
    }
  }

  // ---------------------------------------------------------------- selection

  rowClicked(event: MouseEvent, row: PlaylistRow): void {
    const id: string = row.entry.id;

    if (event.shiftKey && this.anchorId) {
      const ids: string[] = this.rows().map((r: PlaylistRow) => r.entry.id);
      const from: number = ids.indexOf(this.anchorId);
      const to: number = ids.indexOf(id);
      if (from !== -1 && to !== -1) {
        if (!event.ctrlKey) {
          this.selected = new Set();
        }
        ids.slice(Math.min(from, to), Math.max(from, to) + 1).forEach((rangeId: string) => this.selected.add(rangeId));
        return;
      }
    }

    if (event.ctrlKey || event.metaKey) {
      if (this.selected.has(id)) {
        this.selected.delete(id);
      } else {
        this.selected.add(id);
      }
    } else {
      this.selected = new Set([id]);
    }
    this.anchorId = id;
  }

  selectedIdsInOrder(): string[] {
    return this.rows()
      .map((row: PlaylistRow) => row.entry.id)
      .filter((id: string) => this.selected.has(id));
  }

  removeSelected(): void {
    const ids: string[] = this.selectedIdsInOrder();
    if (ids.length) {
      this.playlistService.removeEntries(this.playlist().id, ids);
      this.selected = new Set();
    }
  }

  onKey(event: KeyboardEvent): void {
    if (this.renaming || (event.target as HTMLElement).tagName === 'INPUT') {
      return;
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.stopPropagation();
      this.removeSelected();
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
      event.stopPropagation();
      event.preventDefault();
      this.selected = new Set(this.rows().map((row: PlaylistRow) => row.entry.id));
    } else if (event.key === 'Escape' && this.selected.size) {
      event.stopPropagation();
      this.selected = new Set();
    } else if (event.key === 'Enter' && this.selected.size) {
      event.stopPropagation();
      this.play(this.selectedIdsInOrder()[0]);
    }
  }

  // ---------------------------------------------------------------- right-click menu

  openMenu(event: MouseEvent, row: PlaylistRow): void {
    event.preventDefault();
    if (!this.selected.has(row.entry.id)) {
      this.selected = new Set([row.entry.id]);
      this.anchorId = row.entry.id;
    }
    this.menuRow = row;
    this.menuPosition = {
      x: Math.min(event.clientX, window.innerWidth - 200),
      y: Math.min(event.clientY, window.innerHeight - 200),
    };
  }

  closeMenu(): void {
    this.menuRow = null;
  }

  openPicker(mode: PlaylistPickerMode): void {
    this.pickerMode = mode;
    this.pickerPosition = { ...this.menuPosition };
    this.closeMenu();
  }

  picked(targetId: string): void {
    const copy: boolean = this.pickerMode === 'copy';
    const target: Playlist = this.playlistService.get(targetId);
    const count: number = this.playlistService.transferEntries(this.playlist().id, targetId, this.selectedIdsInOrder(), copy);
    this.pickerMode = null;
    if (!copy) {
      this.selected = new Set();
    }
    this.modalService.openSnackbar(
      this.translate.instant(copy ? 'PLAYLISTS.copiedToSnack' : 'PLAYLISTS.movedToSnack', { count: count, name: target.name }),
      2000
    );
  }

  startLabeling(row: PlaylistRow): void {
    this.closeMenu();
    this.labelingEntryId = row.entry.id;
    this.labelValue = row.entry.label || '';
    setTimeout(() => this.labelInput()?.nativeElement.select(), 0);
  }

  labelKey(event: KeyboardEvent): void {
    event.stopPropagation();
    if (event.key === 'Enter') {
      this.finishLabeling();
    } else if (event.key === 'Escape') {
      this.labelingEntryId = null;
    }
  }

  finishLabeling(): void {
    if (this.labelingEntryId) {
      this.playlistService.updateEntry(this.playlist().id, this.labelingEntryId, { label: this.labelValue });
      this.labelingEntryId = null;
    }
  }

  openContainingFolder(): void {
    const element: ImageElement = this.menuRow.element;
    this.closeMenu();
    if (element) {
      (window as any).myElectron.sendToMain('open-in-explorer', this.filePathService.getPathFromImageElement(element));
    }
  }

  // ---------------------------------------------------------------- drag & drop

  dragStart(event: DragEvent, row: PlaylistRow): void {
    if (!this.selected.has(row.entry.id)) {
      this.selected = new Set([row.entry.id]);
      this.anchorId = row.entry.id;
    }
    const payload: DraggedEntries = { from: this.playlist().id, ids: this.selectedIdsInOrder() };
    event.dataTransfer.setData(DRAG_ENTRIES, JSON.stringify(payload));
    event.dataTransfer.effectAllowed = 'copyMove';
    this.dragging = true;
  }

  dragEnd(): void {
    this.dragging = false;
    this.dropBeforeId = null;
    this.dropAtEnd = false;
  }

  dragOverRow(event: DragEvent, row: PlaylistRow, index: number): void {
    if (!this.dragging || !hasDragType(event, DRAG_ENTRIES)) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    const rect: DOMRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const lowerHalf: boolean = event.clientY > rect.top + rect.height / 2;
    const rows: PlaylistRow[] = this.rows();

    if (lowerHalf) {
      const next: PlaylistRow = rows[index + 1];
      this.dropBeforeId = next ? next.entry.id : null;
      this.dropAtEnd = !next;
    } else {
      this.dropBeforeId = row.entry.id;
      this.dropAtEnd = false;
    }
  }

  dragOverEnd(event: DragEvent): void {
    if (!this.dragging || !hasDragType(event, DRAG_ENTRIES)) {
      return;
    }
    event.preventDefault();
    this.dropBeforeId = null;
    this.dropAtEnd = true;
  }

  drop(event: DragEvent): void {
    if (!this.dragging || !hasDragType(event, DRAG_ENTRIES)) {
      return;
    }
    event.preventDefault();
    const dragged: DraggedEntries = JSON.parse(event.dataTransfer.getData(DRAG_ENTRIES));
    if (this.dropBeforeId || this.dropAtEnd) {
      this.playlistService.reorderEntries(dragged.from, dragged.ids, this.dropAtEnd ? null : this.dropBeforeId);
    }
    this.dragEnd();
  }

}
