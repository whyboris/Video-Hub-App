import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ModalComponent } from './modal.component';
import { WelcomeComponent } from './welcome.component';

export interface DialogData {
  content: string;
  title: string;
  details?: string;
}

@Injectable()
export class ModalService {

  constructor(
    public dialog: MatDialog,
    public snack: MatSnackBar,
  ) { }

  /**
   * Opens a modal popup which can be exited via `Esc` key or clicking outside of it
   * returns a promise you can `.subscribe(() => { ... }` to
   * @param title
   * @param content
   * @param details
   */
  openDialog(title: string, content: string, details: string) {

    const dialogRef = this.dialog.open(
      ModalComponent,
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

  /**
   * Open the welcome message that tells users how to use the app
   */
  openWelcomeMessage() {
    this.dialog.open(WelcomeComponent);
  }

  /**
   * Show "snack bar" / "toaster" at the bottom center with error message for 1.5 seconds
   * @param errorMessage
   */
  openSnackbar(errorMessage: string) {
    this.snack.open(errorMessage, '', {
      duration: 1500,
    });
  }

}
