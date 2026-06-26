import { Component, input, output } from '@angular/core';

import { ImageElementService } from './../../services/image-element.service';
import { SourceFolderService } from '../statistics/source-folder.service';

import { modalAnimation, similarResultsText } from '../../common/animations';

import type { ImageElement } from '../../../../interfaces/final-object.interface';
import type { RightClickEmit } from '../../../../interfaces/shared-interfaces';
import type { SettingsButtonsType } from '../../common/settings-buttons';

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
  readonly openDetailsView = output<ImageElement>();
  readonly refreshPlaylist = output<void>();
  readonly rightMouseClicked = output<RightClickEmit>();
  readonly showMoreRecentlyPlayed = output<void>();

  readonly appState = input();
  readonly currentClickedItemName = input();
  readonly previewHeightRelated = input();
  readonly previewWidthRelated = input();
  readonly settingsButtons = input<SettingsButtonsType>();
  readonly showRecentNotSimilar = input();

  constructor(
    public imageElementService: ImageElementService,
    public sourceFolderService: SourceFolderService,
  ) { }

}
