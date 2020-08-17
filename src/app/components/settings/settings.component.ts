import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { SettingsMetaGroup, SettingsMetaGroupLabels, SettingsButtonsType } from '../../common/settings-buttons';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: [
    '../buttons.scss',
    '../settings.scss',
    '../search-input.scss',
    './settings.component.scss'
  ]
})
export class SettingsComponent implements OnInit{

  @Output() changeLanguage = new EventEmitter<string>();
  @Output() checkForNewVersion = new EventEmitter<any>();
  @Output() chooseDefaultVideoPlayer = new EventEmitter<any>();
  @Output() decreaseZoomLevel = new EventEmitter<any>();
  @Output() goDownloadNewVersion = new EventEmitter<any>();
  @Output() increaseZoomLevel = new EventEmitter<any>();
  @Output() openOnlineHelp = new EventEmitter<any>();
  @Output() resetZoomLevel = new EventEmitter<any>();
  @Output() toggleButton = new EventEmitter<string>();
  @Output() toggleHideButton = new EventEmitter<string>();

  @Input() appState;
  @Input() demo;
  @Input() latestVersionAvailable;
  @Input() settingTabToShow;
  @Input() settingsButtons: SettingsButtonsType;
  @Input() versionNumber;

  settingsMetaGroup = SettingsMetaGroup;
  settingsMetaGroupLabels = SettingsMetaGroupLabels;
  additionalInput: string = '';
  editAdditional: boolean = false;

  constructor() {}
  ngOnInit(): void {
    this.additionalInput = this.appState.addtionalExtensions;
  }

  editAdditionalExtensions() {
    this.editAdditional = !this.editAdditional;
    this.additionalInput = this.appState.addtionalExtensions;
  }

  applyAdditionalExtensions() {
    this.appState.addtionalExtensions = this.additionalInput;
    this.editAdditional = false;
  }

}
