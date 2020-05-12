import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-rename-modal',
  templateUrl: './rename-modal.component.html',
  styleUrls: [
    '../buttons.scss',  // only for `close-modal-icon` class
    '../settings.scss', // only for `close-settings` class
    './rename-modal.component.scss'
  ]
})
export class RenameModalComponent {

  @Output() closeRename = new EventEmitter<any>();

  @Input() appState;
  @Input() macVersion;
  @Input() settingsButtons;
  @Input() itemToRename;
  @Input() currentRightClickedItem;
  @Input() renamingNow;

  constructor() { }

  ngOnInit(): void {}

}
