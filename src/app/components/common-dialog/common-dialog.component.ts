import { DialogData } from './common-dialog.service';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-common-dialog',
  templateUrl: './common-dialog.component.html',
  styleUrls: ['./common-dialog.component.scss'],
})
export class CommonDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

}
