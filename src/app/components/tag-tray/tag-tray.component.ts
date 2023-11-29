import { Component, Input, Output, EventEmitter } from '@angular/core';

import { ManualTagsService } from '../tags-manual/manual-tags.service';

import type { AppStateInterface } from '../../common/app-state';
import type { TagEmit } from '../../../../interfaces/shared-interfaces';
import { modalAnimation } from '../../common/animations';
import type { SettingsButtonsType } from '../../common/settings-buttons';
import { ImageElementService } from './../../services/image-element.service';

@Component({
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

  selectedTagList = [];
  removeThisTag(tag: string) {
    //get the list of all the videos that contain the selected tag for removal in batch
    this.selectedTagList = this.imageElementService.imageElements
      .map((ele, idx) => {
        if (ele.tags?.includes(tag)) {
          return idx;
        }
      })
      .filter((item) => item != undefined);

    this.manualTagsService.removeTagBatch(tag);

    this.selectedTagList.forEach((item) => {
      this.imageElementService.HandleEmission({
        index: item,
        tag: tag,
        type: "remove",
      });
    });
  }

  constructor(
    public manualTagsService: ManualTagsService,
    public imageElementService: ImageElementService
  ) { }

}
