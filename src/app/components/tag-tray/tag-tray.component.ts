import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ManualTagsService } from '../tags-manual/manual-tags.service';
import { TagEmit } from '../../../../interfaces/shared-interfaces';
import { modalAnimation } from '../../common/animations';

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

  @Output() closeTagsTray = new EventEmitter<any>();
  @Output() toggleBatchTaggingMode = new EventEmitter<any>();
  @Output() handleTagWordClicked = new EventEmitter<TagEmit>();

  @Input() batchTaggingMode;
  @Input() settingsButtons;

  manualTagFilterString: string = '';
  manualTagShowFrequency: boolean = true;

  constructor(
    public manualTagsService: ManualTagsService,
  ) { }

}
