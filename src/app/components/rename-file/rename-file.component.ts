import { Component, ChangeDetectorRef, OnInit, Input, ElementRef, ViewChild } from '@angular/core';

import { ElectronService } from '../../providers/electron.service';

@Component({
  selector: 'app-rename-file',
  templateUrl: './rename-file.component.html',
  styleUrls: [
    '../rightclick.scss',
    '../wizard-button.scss',
    './rename-file.component.scss'
  ]
})
export class RenameFileComponent implements OnInit {
  @ViewChild('renameFileInput', { static: false }) renameFileInput: ElementRef;

  @Input() selectedSourceFolder: string;
  @Input() currentRightClickedItem: any;
  @Input() macVersion: boolean;
  @Input() darkMode: boolean;

  renamingWIP: string;
  renamingExtension: string;
  nodeRenamingFile: boolean = false;
  renameErrMsg: string = '';

  constructor(
    public cd: ChangeDetectorRef,
    public electronService: ElectronService
  ) { }

  ngOnInit(): void {
    this.openRenameFileModal();

    setTimeout(() => {
      this.renameFileInput.nativeElement.focus();
    }, 0);

    // Getting the error message to display
    this.electronService.ipcRenderer.on(
      'renameFileResponse', (event, index: number, success: boolean, renameTo: string, oldFileName: string, errMsg?: string) => {

      this.nodeRenamingFile = false;

      if (success) {
        console.log('yay!');
      } else {
        console.log('ERROR', errMsg);
        this.renameErrMsg = errMsg;
        this.cd.detectChanges();
      }
    });
  }

  /**
   * Click rename file button, prepares all the name and extension
   */
  openRenameFileModal(): void {
    const item = this.currentRightClickedItem;

    // .slice() creates a copy
    const fileName = item.fileName.slice().substr(0, item.fileName.lastIndexOf('.'));
    const extension = item.fileName.slice().split('.').pop();

    this.renamingWIP = fileName;
    this.renamingExtension = extension;
  }

  /**
   * Attempt to rename file
   * check for simple errors locally
   * ask Node to perform rename after
   */
  attemptToRename() {
    this.nodeRenamingFile = true;
    this.renameErrMsg = '';

    const sourceFolder = this.selectedSourceFolder;
    const relativeFilePath = this.currentRightClickedItem.partialPath;
    const originalFile = this.currentRightClickedItem.fileName;
    const newFileName = this.renamingWIP + '.' + this.renamingExtension;
    // check if different first !!!
    if (originalFile === newFileName) {
      this.renameErrMsg = 'RIGHTCLICK.errorMustBeDifferent';
      this.nodeRenamingFile = false;
    } else if (this.renamingWIP.length === 0) {
      this.renameErrMsg = 'RIGHTCLICK.errorMustNotBeEmpty';
      this.nodeRenamingFile = false;
    } else {
      // try renaming
      this.electronService.ipcRenderer.send(
        'try-to-rename-this-file',
        sourceFolder,
        relativeFilePath,
        originalFile,
        newFileName,
        this.currentRightClickedItem.index
      );
    }
  }
}
