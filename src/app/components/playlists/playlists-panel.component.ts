import type { ElementRef } from '@angular/core';
import { Component, input, viewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ExportService } from '../../services/export.service';
import { ImageElementService } from '../../services/image-element.service';
import { ModalService } from '../modal/modal.service';
import { PlayerService } from '../../services/player.service';
import { PlaylistService } from '../../services/playlist.service';

import type { ContextMenuCoordinate } from '../../../../interfaces/shared-interfaces';
import type { ImageElement } from '../../../../interfaces/final-object.interface';
import type { Playlist, PlaylistKind } from '../../../../interfaces/playlist.interface';

import { DRAG_ENTRIES, DRAG_PLAYLIST, formatDuration, hasDragType } from './playlist-utils';
import type { DraggedEntries } from './playlist-utils';

/**
 * Sidebar list of playlists & compilations
 * - click to open, double-click to rename, right-click for more
 * - drop playlist rows on an item to move them there (hold Ctrl to copy)
 * - drag items to reorder the list
 */
@Component({
  standalone: false,
  selector: 'app-playlists-panel',
  templateUrl: './playlists-panel.component.html',
  styleUrls: ['./playlists-panel.component.scss']
})
export class PlaylistsPanelComponent {

  readonly newNameInput = viewChild<ElementRef>('newNameInput');
  readonly renameInput = viewChild<ElementRef>('renameInput');

  readonly darkMode = input<boolean>(false);

  creatingKind: PlaylistKind = null;
  newName = '';

  renamingId: string = null;
  renameValue = '';

  menuFor: Playlist = null;
  menuPosition: ContextMenuCoordinate = { x: 0, y: 0 };
  confirmingDelete = false;
  selectedVideos: ImageElement[] = [];

  dropTargetId: string = null;    // entries being dropped onto this playlist
  dropBeforeId: string = null;    // playlist being reordered to before this one

  formatDuration = formatDuration;

  constructor(
    public exportService: ExportService,
    public imageElementService: ImageElementService,
    public modalService: ModalService,
    public playerService: PlayerService,
    public playlistService: PlaylistService,
    public translate: TranslateService,
  ) { }

  list(): Playlist[] {
    this.playlistService.version(); // re-evaluate on change
    return this.playlistService.playlists;
  }

  /**
   * Clicking the open playlist again goes back to the gallery
   */
  open(playlist: Playlist): void {
    if (this.renamingId === playlist.id) {
      return;
    }
    if (this.playlistService.openPlaylistId === playlist.id) {
      this.playlistService.close();
    } else {
      this.playlistService.open(playlist.id);
    }
  }

  // ---------------------------------------------------------------- create

  startCreating(kind: PlaylistKind): void {
    this.creatingKind = kind;
    this.newName = '';
    setTimeout(() => this.newNameInput()?.nativeElement.focus(), 0);
  }

  newNameKey(event: KeyboardEvent): void {
    event.stopPropagation(); // keep app shortcuts from firing while typing
    if (event.key === 'Enter') {
      this.finishCreating();
    } else if (event.key === 'Escape') {
      this.creatingKind = null;
    }
  }

  /**
   * Creates the playlist but stays in the gallery -- an empty playlist has nothing to show,
   * and videos are added from the gallery anyway
   */
  finishCreating(): void {
    if (this.creatingKind && this.newName.trim()) {
      const playlist: Playlist = this.playlistService.create(this.newName, this.creatingKind);
      if (playlist) {
        this.modalService.openSnackbar(this.translate.instant('PLAYLISTS.createdSnack', { name: playlist.name }), 3000);
      }
    }
    this.creatingKind = null;
  }

  // ---------------------------------------------------------------- rename

  startRenaming(playlist: Playlist): void {
    this.closeMenu();
    this.renamingId = playlist.id;
    this.renameValue = playlist.name;
    setTimeout(() => this.renameInput()?.nativeElement.select(), 0);
  }

  renameKey(event: KeyboardEvent, playlist: Playlist): void {
    event.stopPropagation();
    if (event.key === 'Enter') {
      this.finishRenaming(playlist);
    } else if (event.key === 'Escape') {
      this.renamingId = null;
    }
  }

  finishRenaming(playlist: Playlist): void {
    if (this.renamingId === playlist.id) {
      this.playlistService.rename(playlist.id, this.renameValue);
      this.renamingId = null;
    }
  }

  // ---------------------------------------------------------------- right-click menu

  openMenu(event: MouseEvent, playlist: Playlist): void {
    event.preventDefault();
    this.menuFor = playlist;
    this.confirmingDelete = false;
    this.selectedVideos = this.imageElementService.imageElements.filter((element: ImageElement) => element.selected && !element.deleted);
    this.menuPosition = {
      x: Math.min(event.clientX, window.innerWidth - 200),
      y: Math.min(event.clientY, window.innerHeight - 240),
    };
  }

  closeMenu(): void {
    this.menuFor = null;
    this.confirmingDelete = false;
  }

  play(shuffle: boolean, external?: boolean): void {
    const playlist: Playlist = this.menuFor;
    this.closeMenu();
    if (!this.playerService.playPlaylist(playlist.id, undefined, shuffle, external)) {
      this.modalService.openSnackbar(this.translate.instant('PLAYLISTS.nothingToPlay'), 2500);
    }
  }

  exportVideo(): void {
    const playlist: Playlist = this.menuFor;
    this.closeMenu();
    this.exportService.open(playlist.id);
  }

  exportPercent(): number {
    this.exportService.version(); // re-evaluate on change
    return Math.round(100 * this.exportService.progress.fraction);
  }

  duplicate(): void {
    const copy: Playlist = this.playlistService.duplicate(this.menuFor.id);
    this.closeMenu();
    if (copy) {
      this.playlistService.open(copy.id);
    }
  }

  addSelected(): void {
    const playlist: Playlist = this.menuFor;
    const added: number = this.playlistService.addVideos(playlist.id, this.selectedVideos);
    this.closeMenu();
    this.modalService.openSnackbar(this.translate.instant('PLAYLISTS.addedToSnack', { count: added, name: playlist.name }), 2000);
  }

  delete(): void {
    if (!this.confirmingDelete) {
      this.confirmingDelete = true;
      return;
    }
    this.playlistService.delete(this.menuFor.id);
    this.closeMenu();
  }

  // ---------------------------------------------------------------- drag & drop

  dragPlaylistStart(event: DragEvent, playlist: Playlist): void {
    if (this.renamingId) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData(DRAG_PLAYLIST, playlist.id);
    event.dataTransfer.effectAllowed = 'move';
  }

  dragOver(event: DragEvent, playlist: Playlist): void {
    if (hasDragType(event, DRAG_ENTRIES)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = event.ctrlKey ? 'copy' : 'move';
      this.dropTargetId = playlist.id;
    } else if (hasDragType(event, DRAG_PLAYLIST)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      this.dropBeforeId = playlist.id;
    }
  }

  dragLeave(): void {
    this.dropTargetId = null;
    this.dropBeforeId = null;
  }

  drop(event: DragEvent, playlist: Playlist): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragLeave();

    if (hasDragType(event, DRAG_ENTRIES)) {
      const dragged: DraggedEntries = JSON.parse(event.dataTransfer.getData(DRAG_ENTRIES));
      if (dragged.from === playlist.id) {
        return;
      }
      const copy: boolean = event.ctrlKey;
      const count: number = this.playlistService.transferEntries(dragged.from, playlist.id, dragged.ids, copy);
      this.modalService.openSnackbar(
        this.translate.instant(copy ? 'PLAYLISTS.copiedToSnack' : 'PLAYLISTS.movedToSnack', { count: count, name: playlist.name }),
        2000
      );
    } else if (hasDragType(event, DRAG_PLAYLIST)) {
      this.playlistService.reorderPlaylist(event.dataTransfer.getData(DRAG_PLAYLIST), playlist.id);
    }
  }

  /**
   * Dropping a playlist on the empty area below the list moves it to the end
   */
  dropAtEnd(event: DragEvent): void {
    if (hasDragType(event, DRAG_PLAYLIST)) {
      event.preventDefault();
      this.dragLeave();
      this.playlistService.reorderPlaylist(event.dataTransfer.getData(DRAG_PLAYLIST), null);
    }
  }

  dragOverEnd(event: DragEvent): void {
    if (hasDragType(event, DRAG_PLAYLIST)) {
      event.preventDefault();
    }
  }

}
