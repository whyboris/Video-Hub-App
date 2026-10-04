import { Injectable, NgZone, signal } from '@angular/core';

import { FilePathService } from '../components/views/file-path.service';
import { PlaylistService } from './playlist.service';
import { SourceFolderService } from '../components/statistics/source-folder.service';

import type { ExportClip, ExportJob, ExportProgress, ExportResult } from '../../../interfaces/export.interface';
import type { ImageElement } from '../../../interfaces/final-object.interface';
import type { Playlist, PlaylistEntry } from '../../../interfaces/playlist.interface';

export type ExportSize = '1080' | '720' | 'source';
export type ExportFrame = 'landscape' | 'portrait';
export type ExportStatus = 'options' | 'choosing' | 'running' | 'done' | 'failed' | 'cancelled';

interface PreparedClip {
  clip: ExportClip;
  element: ImageElement;
}

/**
 * Exporting a playlist or compilation as one MP4 -- the work happens in `node/main-export.ts`
 */
@Injectable({ providedIn: 'root' })
export class ExportService {

  readonly version = signal(0); // bumps on every change so views can recompute

  dialogOpen = false;
  playlistId: string = null;
  playlistName = '';
  status: ExportStatus = 'options';

  size: ExportSize = '1080';
  frame: ExportFrame = 'landscape';
  captions = true;

  progress: ExportProgress = { fraction: 0, clip: 0, clipCount: 0 };
  result: ExportResult = null;

  private exportId: string = null;
  private counter = 0;

  constructor(
    private filePathService: FilePathService,
    private playlistService: PlaylistService,
    private sourceFolderService: SourceFolderService,
    private zone: NgZone,
  ) {
    const myElectron = (window as any).myElectron;

    myElectron.receiveFromMain('export-path-chosen', (requestId: string, outputPath: string) => {
      this.zone.run(() => {
        if (requestId !== this.exportId || this.status !== 'choosing') {
          return;
        }
        if (outputPath) {
          this.start(outputPath);
        } else {
          this.status = 'options'; // save dialog cancelled
          this.bump();
        }
      });
    });

    myElectron.receiveFromMain('export-progress', (exportId: string, progress: ExportProgress) => {
      if (exportId === this.exportId) {
        this.zone.run(() => {
          this.progress = progress;
          this.bump();
        });
      }
    });

    myElectron.receiveFromMain('export-finished', (exportId: string, result: ExportResult) => {
      if (exportId === this.exportId) {
        this.zone.run(() => {
          this.result = result;
          this.status = result.ok ? 'done' : (result.cancelled ? 'cancelled' : 'failed');
          this.dialogOpen = true; // show the outcome even if the dialog was hidden
          this.bump();
        });
      }
    });
  }

  get running(): boolean {
    return this.status === 'running' || this.status === 'choosing';
  }

  /**
   * Open the export dialog for a playlist (only one export runs at a time)
   */
  open(playlistId: string): void {
    if (this.running) {
      this.dialogOpen = true; // show the running export instead
      this.bump();
      return;
    }
    const playlist: Playlist = this.playlistService.get(playlistId);
    if (!playlist) {
      return;
    }
    this.playlistId = playlistId;
    this.playlistName = playlist.name;
    this.status = 'options';
    this.result = null;
    this.progress = { fraction: 0, clip: 0, clipCount: 0 };
    this.captions = this.labelCount() > 0;
    this.dialogOpen = true;
    this.bump();
  }

  /**
   * Hide the dialog -- a running export carries on, with progress in the sidebar
   */
  hide(): void {
    this.dialogOpen = false;
    if (!this.running) {
      this.playlistId = null;
    }
    this.bump();
  }

  // ---------------------------------------------------------------- what will be exported

  /**
   * Clips that can be exported: missing videos and offline folders are left out
   */
  preparedClips(): PreparedClip[] {
    const playlist: Playlist = this.playlistService.get(this.playlistId);
    if (!playlist) {
      return [];
    }
    const prepared: PreparedClip[] = [];
    playlist.entries.forEach((entry: PlaylistEntry) => {
      const element: ImageElement = this.playlistService.resolve(entry);
      if (!element || !this.sourceFolderService.sourceFolderConnected[element.inputSource]) {
        return;
      }
      const isHighlight: boolean = entry.start !== undefined && entry.end !== undefined;
      prepared.push({
        element: element,
        clip: {
          path: this.filePathService.getPathFromImageElement(element),
          start: isHighlight ? entry.start : 0,
          duration: isHighlight ? entry.end - entry.start : element.duration,
          label: entry.label,
        },
      });
    });
    return prepared;
  }

  entryCount(): number {
    const playlist: Playlist = this.playlistService.get(this.playlistId);
    return playlist ? playlist.entries.length : 0;
  }

  labelCount(): number {
    return this.preparedClips().filter((p: PreparedClip) => !!p.clip.label).length;
  }

  totalSeconds(): number {
    return this.preparedClips().reduce((sum: number, p: PreparedClip) => sum + p.clip.duration, 0);
  }

  /**
   * Output frame in pixels
   */
  dimensions(): { width: number, height: number } {
    let width: number;
    let height: number;
    if (this.size === '1080') {
      width = 1920; height = 1080;
    } else if (this.size === '720') {
      width = 1280; height = 720;
    } else {
      // the largest clip, capped at 4K
      const clips: PreparedClip[] = this.preparedClips();
      const longSide: number = Math.max(640, ...clips.map((p: PreparedClip) => Math.max(p.element.width || 0, p.element.height || 0)));
      const shortSide: number = Math.max(360, ...clips.map((p: PreparedClip) => Math.min(p.element.width || 0, p.element.height || 0)));
      width = Math.min(3840, longSide);
      height = Math.min(2160, shortSide);
    }
    if (this.frame === 'portrait') {
      [width, height] = [height, width];
    }
    return { width: Math.round(width / 2) * 2, height: Math.round(height / 2) * 2 };
  }

  // ---------------------------------------------------------------- running

  /**
   * Ask where to save, then start
   */
  chooseAndExport(): void {
    if (!this.preparedClips().length) {
      return;
    }
    this.exportId = 'export' + (++this.counter);
    this.status = 'choosing';
    this.bump();
    (window as any).myElectron.sendToMain('choose-export-path', this.exportId, this.playlistName);
  }

  private start(outputPath: string): void {
    const { width, height } = this.dimensions();
    const job: ExportJob = {
      outputPath: outputPath,
      width: width,
      height: height,
      captions: this.captions,
      clips: this.preparedClips().map((p: PreparedClip) => p.clip),
    };
    this.progress = { fraction: 0, clip: 0, clipCount: job.clips.length };
    this.status = 'running';
    this.bump();
    (window as any).myElectron.sendToMain('start-export', this.exportId, job);
  }

  cancel(): void {
    if (this.exportId && this.running) {
      (window as any).myElectron.sendToMain('cancel-export', this.exportId);
    }
  }

  showInFolder(): void {
    if (this.result && this.result.outputPath) {
      (window as any).myElectron.sendToMain('open-in-explorer', this.result.outputPath);
    }
  }

  playResult(): void {
    if (this.result && this.result.outputPath) {
      (window as any).myElectron.sendToMain('open-media-file', this.result.outputPath);
    }
  }

  private bump(): void {
    this.version.update(value => value + 1);
  }

}
