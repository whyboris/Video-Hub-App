import { Component, input } from '@angular/core';

import { ExportService } from '../../services/export.service';

import { formatDuration } from './playlist-utils';

/**
 * Options, progress and result of exporting a playlist or compilation as one MP4
 */
@Component({
  standalone: false,
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.scss']
})
export class ExportDialogComponent {

  readonly darkMode = input<boolean>(false);

  formatDuration = formatDuration;

  constructor(
    public exportService: ExportService,
  ) { }

  percent(): number {
    this.exportService.version(); // re-evaluate on change
    return Math.round(100 * this.exportService.progress.fraction);
  }

  skippedText(): string {
    const skipped: number[] = this.exportService.result ? this.exportService.result.skipped : [];
    return skipped.join(', ');
  }

  backdropClicked(): void {
    if (!this.exportService.running) {
      this.exportService.hide();
    }
  }

}
