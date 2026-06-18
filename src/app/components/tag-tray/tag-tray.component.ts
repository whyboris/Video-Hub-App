import { Component, input, output } from '@angular/core';

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

  readonly toggleBatchTaggingMode = output<void>();
  readonly handleTagWordClicked = output<TagEmit>();
  readonly selectAll = output<void>();

  readonly appState = input<AppStateInterface>(undefined);
  readonly batchTaggingMode = input(undefined);
  readonly darkMode = input<boolean>(undefined);
  readonly settingsButtons = input<SettingsButtonsType>(undefined);

  manualTagFilterString = '';
  manualTagShowFrequency = true;

  constructor(
    public manualTagsService: ManualTagsService,
  ) { }

  /**
   * Handle tag right-click event - show color picker via service
   * @param event - Object containing tag and mouse event
   */
  onTagRightClick(event: { tag: any, event: MouseEvent }): void {
    // Emit event to show color picker at home component level
    this.manualTagsService.showColorPickerSubject.next({
      tagName: event.tag.name,
      currentColor: event.tag.colour || '',
      position: {
        x: event.event.clientX,
        y: event.event.clientY
      }
    });
  }

}
