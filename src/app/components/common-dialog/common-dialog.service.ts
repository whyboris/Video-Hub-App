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

constructor(public dialog: MatDialog) { }

openDialog(title: string, content: string, details: string) {
  const dialogRef = this.dialog.open(
    CommonDialogComponent,
    {
      height: '200px',
      width: '300px',
      data: {
        content: content,
        title: title,
        details: details
      }
    }
  );
  return dialogRef.afterClosed;
}
}
