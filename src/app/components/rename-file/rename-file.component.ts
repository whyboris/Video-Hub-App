import { Component, ChangeDetectorRef, OnInit, Input, ElementRef, ViewChild, OnDestroy } from '@angular/core';

import { Observable, Subscription } from 'rxjs';

import { ElectronService } from '../../providers/electron.service';
import { FilePathService } from '../views/file-path.service';

import { ImageElement, InputSources } from '../../../../interfaces/final-object.interface';
import { RenameFileResponse } from '../../../../interfaces/shared-interfaces';

@Component({
  selector: 'app-rename-file',
  templateUrl: './rename-file.component.html',
  styleUrls: [
    '../rightclick.scss',
    '../wizard-button.scss',
    './rename-file.component.scss'
  ]
})
export class RenameFileComponent implements OnInit, OnDestroy {
  @ViewChild('renameFileInput', { static: false }) renameFileInput: ElementRef;

  @Input() currentRightClickedItem: ImageElement;
  @Input() darkMode: boolean;
  @Input() macVersion: boolean;
  @Input() selectedSourceFolder: string;

  @Input() renameResponse: Observable<RenameFileResponse>

  renamingWIP: string;
  renamingExtension: string;
  nodeRenamingFile: boolean = false;
  renameErrMsg: string = '';

  responseSubscription: Subscription;

  constructor(
    public cd: ChangeDetectorRef,
    public electronService: ElectronService,
    public filePathService: FilePathService,
  ) { }

  ngOnInit(): void {
    this.renamingWIP = this.filePathService.getFileNameWithoutExtension(this.currentRightClickedItem.fileName);
    this.renamingExtension = this.filePathService.getFileNameExtension(this.currentRightClickedItem.fileName);

    setTimeout(() => {
      this.renameFileInput.nativeElement.focus();
    }, 0);

    this.responseSubscription = this.renameResponse.subscribe((data) => {

      if (data) {
        console.log('WOW !!!');
        console.log(data);

        // just in case, make sure the message came back for the current file
        if (this.currentRightClickedItem.index === data.index && !data.success) {
          this.nodeRenamingFile = false;
          this.renameErrMsg = data.errMsg;
          this.cd.detectChanges();
        } // if success, the `home.component` closes this component, no need to do anything else
      }

    });
  }

  /**
   * Attempt to rename file
   * check for simple errors locally
   * ask Node to perform rename after
   */
  attemptToRename() {
    this.nodeRenamingFile = true;
    this.renameErrMsg = '';

    const sourceFolder: string = this.selectedSourceFolder;
    const relativeFilePath: string = this.currentRightClickedItem.partialPath;
    const originalFile: string = this.currentRightClickedItem.fileName;
    const newFileName: string = this.renamingWIP + '.' + this.renamingExtension;
    // check if different first !!!
    if (originalFile === newFileName) {
      this.renameErrMsg = 'RIGHTCLICK.errorMustBeDifferent';
      this.nodeRenamingFile = false;
    } else if (this.renamingWIP.length === 0) {
      this.renameErrMsg = 'RIGHTCLICK.errorMustNotBeEmpty';
      this.nodeRenamingFile = false;
    } else {
      // try renaming

      console.log(this.selectedSourceFolder);
      console.log(sourceFolder);

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

  ngOnDestroy() {
    this.responseSubscription.unsubscribe();
  }
}
