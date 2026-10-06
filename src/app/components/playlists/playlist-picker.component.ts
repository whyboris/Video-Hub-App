import type { ElementRef, OnInit } from '@angular/core';
import { Component, computed, input, output, viewChild } from '@angular/core';

import { PlaylistService } from '../../services/playlist.service';

import type { ContextMenuCoordinate } from '../../../../interfaces/shared-interfaces';
import type { Playlist, PlaylistKind } from '../../../../interfaces/playlist.interface';

export type PlaylistPickerMode = 'add' | 'move' | 'copy' | 'target';

const PICKER_WIDTH = 230;
const PICKER_MAX_HEIGHT = 340;

/**
 * Small popover listing all playlists -- used for `Add to playlist`, `Move to` and `Copy to`
 * Includes an inline box to create a new playlist and pick it in one go
 */
@Component({
  standalone: false,
  selector: 'app-playlist-picker',
  templateUrl: './playlist-picker.component.html',
  styleUrls: ['./playlist-picker.component.scss']
})
export class PlaylistPickerComponent implements OnInit {

  readonly newNameInput = viewChild<ElementRef>('newNameInput');

  readonly closed = output<void>();
  readonly picked = output<string>();

  readonly darkMode = input<boolean>(false);
  readonly excludePlaylistId = input<string>(null);  // the source playlist when moving / copying
  readonly hashToCheck = input<string>(null);        // shows a check mark on playlists that hold this video
  readonly mode = input<PlaylistPickerMode>('add');
  readonly newKind = input<PlaylistKind>('playlist');
  readonly position = input<ContextMenuCoordinate>({ x: 0, y: 0 });

  creatingNew = false;
  newName = '';

  readonly clampedPosition = computed(() => {
    const pos: ContextMenuCoordinate = this.position();
    return {
      x: Math.max(4, Math.min(pos.x, window.innerWidth - PICKER_WIDTH - 4)),
      y: Math.max(4, Math.min(pos.y, window.innerHeight - PICKER_MAX_HEIGHT - 4)),
    };
  });

  constructor(
    public playlistService: PlaylistService,
  ) { }

  ngOnInit(): void {
    if (!this.choices().length) {
      this.startCreating();
    }
  }

  choices(): Playlist[] {
    this.playlistService.version(); // re-evaluate on change
    return this.playlistService.playlists.filter((playlist: Playlist) => playlist.id !== this.excludePlaylistId());
  }

  holdsVideo(playlist: Playlist): boolean {
    const hash: string = this.hashToCheck();
    return !!hash && this.playlistService.containsWholeVideo(playlist, hash);
  }

  pick(playlistId: string): void {
    this.picked.emit(playlistId);
  }

  startCreating(): void {
    this.creatingNew = true;
    setTimeout(() => this.newNameInput()?.nativeElement.focus(), 0);
  }

  createAndPick(): void {
    const name: string = this.newName.trim();
    if (!name) {
      return;
    }
    const playlist: Playlist = this.playlistService.create(name, this.newKind());
    if (playlist) {
      this.pick(playlist.id);
    }
  }

  onNewNameKey(event: KeyboardEvent): void {
    event.stopPropagation(); // keep app shortcuts from firing while typing
    if (event.key === 'Enter') {
      this.createAndPick();
    } else if (event.key === 'Escape') {
      this.closed.emit();
    }
  }

}
