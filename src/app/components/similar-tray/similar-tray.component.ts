import { Component, input, output } from '@angular/core';

import { ImageElementService } from './../../services/image-element.service';
import { SourceFolderService } from '../statistics/source-folder.service';

import type { RightClickEmit } from '@my/shared-interfaces';
import type { SettingsButtonsType } from '../../common/settings-buttons';
import { modalAnimation, similarResultsText } from '../../common/animations';

@Component({
  standalone: false,
  selector: 'app-similar-tray',
  templateUrl: './similar-tray.component.html',
  styleUrls: [
    '../layout.scss',
    '../buttons.scss',
    './similar-tray.component.scss'
  ],
  animations: [modalAnimation, similarResultsText]
})
export class SimilarTrayComponent {

  readonly handleClick = output<any>(); // TODO: fix up the vague type
  readonly rightMouseClicked = output<RightClickEmit>();
  readonly showMoreRecentlyPlayed = output<any>();

  readonly appState = input(undefined);
  readonly currentClickedItemName = input(undefined);
  readonly previewHeightRelated = input(undefined);
  readonly previewWidthRelated = input(undefined);
  readonly settingsButtons = input<SettingsButtonsType>(undefined);
  readonly showRecentNotSimilar = input(undefined);

  constructor(
    public imageElementService: ImageElementService,
    public sourceFolderService: SourceFolderService,
  ) { }

}
