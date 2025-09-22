import type { OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { ElectronService } from './../../providers/electron.service';
import { ModalService } from './../modal/modal.service';

import type { SettingsButtonsType } from '../../common/settings-buttons';
import { SettingsMetaGroup, SettingsMetaGroupLabels } from '../../common/settings-buttons';

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
export class SettingsComponent implements OnInit, OnChanges {

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
  @Output() scrollSettingsToTop = new EventEmitter<void>();

  @Input() appState;
  @Input() demo;
  @Input() latestVersionAvailable;
  @Input() settingTabToShow;
  @Input() settingsButtons: SettingsButtonsType;
  @Input() versionNumber;

  @ViewChild('settingsModal') settingsModal: ElementRef;

  additionalInput = '';
  editAdditional = false;
  settingsMetaGroup = SettingsMetaGroup;
  settingsMetaGroupLabels = SettingsMetaGroupLabels;

  constructor(
    private electronService: ElectronService,
    private modalService: ModalService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.additionalInput = this.appState.addtionalExtensions;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.settingTabToShow) {
      this.scrollSettingsToTop.emit();
    }
  }

  editAdditionalExtensions() {
    this.editAdditional = !this.editAdditional;
    this.additionalInput = this.appState.addtionalExtensions;
  }

  applyAdditionalExtensions() {
    if (this.isAdditionalInputValid(this.additionalInput)) {
      this.appState.addtionalExtensions = this.additionalInput;
      this.electronService.ipcRenderer.send('update-additional-extensions', this.additionalInput);
      this.editAdditional = false;
    } else {
      this.modalService.openSnackbar(this.translate.instant('SETTINGS.extensionsInputError'));
    }
  }

  private isAdditionalInputValid(input: string): boolean {
    let valid = true;
    input.split(',').forEach(element => {
      if (/[^A-Za-z0-9]/.test(element.trim())) {
        valid = false;
      }
    });

    return valid;
  }

}
