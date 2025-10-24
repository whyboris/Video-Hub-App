import { Component, Input, Output, EventEmitter } from '@angular/core';

import { ManualTagsService } from '../tags-manual/manual-tags.service';

import type { AppStateInterface } from '../../common/app-state';
import type { TagEmit } from '../../../../interfaces/shared-interfaces';
import { modalAnimation } from '../../common/animations';
import type { SettingsButtonsType } from '../../common/settings-buttons';

@Component({
  standalone: false,
  selector: 'app-tag-tray',
  templateUrl: './tag-tray.component.html',
  styleUrls: [
    '../layout.scss',
    '../settings.scss',
    '../search-input.scss',
    '../wizard-button.scss',
    './tag-tray.component.scss'
  ],
  animations: [modalAnimation]
})
export class TagTrayComponent {

  @Output() toggleBatchTaggingMode = new EventEmitter<any>();
  @Output() handleTagWordClicked = new EventEmitter<TagEmit>();
  @Output() selectAll = new EventEmitter<any>();

  @Input() appState: AppStateInterface;
  @Input() batchTaggingMode;
  @Input() darkMode: boolean;
  @Input() settingsButtons: SettingsButtonsType;

  manualTagFilterString = '';
  manualTagShowFrequency = true;

  constructor(
    public manualTagsService: ManualTagsService,
  ) { }

}
