import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-title-bar',
  templateUrl: './title-bar.component.html',
  styleUrls: ['./title-bar.component.scss']
})
export class TitleBarComponent {

  @Output() initiateClose = new EventEmitter<any>();
  @Output() initiateMaximize = new EventEmitter<any>();
  @Output() initiateMinimize = new EventEmitter<any>();

  @Input() appState;
  @Input() demo: boolean;
  @Input() importStage;
  @Input() macVersion: boolean;
  @Input() progressString;
  @Input() rootFolderLive;
  @Input() settingsButtons;

  constructor() { }

}
