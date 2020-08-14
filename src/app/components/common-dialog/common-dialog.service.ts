import { MatDialog } from '@angular/material/dialog';
import { Injectable } from '@angular/core';
import { CommonDialogComponent } from './common-dialog.component';

export interface DialogData {
  content: string;
  title: string;
  details?: string;
}

@Injectable()
export class CommonDialogService {

  constructor(
    public dialog: MatDialog
  ) { }

  /**
   * Opens a modal popup which can be exited via `Esc` key or clicking outside of it
   * @param title
   * @param content
   * @param details
   */
  openDialog(title: string, content: string, details: string) {

    const dialogRef = this.dialog.open(
      CommonDialogComponent,
      {
        data: {
          content: content,
          details: details,
          title: title,
        }
      }
    );

    return dialogRef.afterClosed();
  }

}
