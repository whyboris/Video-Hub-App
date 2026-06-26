import { Component, input, output, viewChild } from '@angular/core';

import { FilePathService } from '../file-path.service';
import { ImageElementService } from './../../../services/image-element.service';
import { ManualTagsService } from '../../tags-manual/manual-tags.service';

import type { BehaviorSubject } from 'rxjs';
import type { ElementRef } from '@angular/core';
import type { StarRating, ImageElement } from '../../../../../interfaces/final-object.interface';
import type { VideoClickEmit, RightClickEmit, TagEmit, RenameFileResponse } from '../../../../../interfaces/shared-interfaces';

export interface YearEmission {
  index: number;
  year: number;
}

@Component({
  standalone: false,
  selector: 'app-details-item',
  templateUrl: './details.component.html',
  styleUrls: [
      '../time-and-rez.scss',
      './details.component.scss',
      '../selected.scss'
    ]
})
export class DetailsComponent {

  readonly filmstripHolder = viewChild<ElementRef>('filmstripHolder');

  readonly filterTag = output<TagEmit>();
  readonly videoClick = output<VideoClickEmit>();
  readonly rightClick = output<RightClickEmit>();
  readonly sheetClick = output<void>();
  readonly refreshPlaylist = output<void>();

  readonly video = input<ImageElement>();

  readonly connected = input<boolean>();
  readonly darkMode = input<boolean>();
  readonly draggable = input<boolean>();
  readonly elHeight = input<number>();
  readonly elWidth = input<number>();
  readonly folderPath = input<string>();
  readonly hoverScrub = input<boolean>();
  readonly hubName = input<string>();
  readonly imgHeight = input<number>();
  readonly largerFont = input<boolean>();
  readonly maxWidth = input<number>();
  readonly returnToFirstScreenshot = input<boolean>();
  readonly selectedSourceFolder = input<string>();
  readonly showAutoFileTags = input<boolean>();
  readonly showAutoFolderTags = input<boolean>();
  readonly showFavorites = input<boolean>();
  readonly showManualTags = input<boolean>();
  readonly showMeta = input<boolean>();
  readonly showTwoColumns = input<boolean>();
  readonly showVideoNotes = input<boolean>();
  readonly star = input<StarRating>();
  readonly thumbAutoAdvance = input<boolean>();

  readonly renameResponse = input<BehaviorSubject<RenameFileResponse>>();

  starRatingHack: StarRating; // updates stars when heart toggled in app-thumbnail

  constructor(
    public filePathService: FilePathService,
    public imageElementService: ImageElementService,
    public manualTagsService: ManualTagsService
  ) { }

  toggleHeart(): void {
    const video = this.video();
    this.starRatingHack = video.stars;
  }

}
