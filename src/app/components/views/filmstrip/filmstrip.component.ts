import type { OnInit, ElementRef} from '@angular/core';
import { Component, ViewChild, Output, EventEmitter, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { FilePathService } from '../file-path.service';

import { metaAppear, textAppear } from '../../../common/animations';

import type { ImageElement } from '../../../../../interfaces/final-object.interface';
import { ImageElementService } from './../../../services/image-element.service';
import type { RightClickEmit, VideoClickEmit } from '../../../../../interfaces/shared-interfaces';

@Component({
  standalone: false,
  selector: 'app-filmstrip-item',
  templateUrl: './filmstrip.component.html',
  styleUrls: [
      '../film-and-full.scss',
      '../time-and-rez.scss',
      '../selected.scss',
      './filmstrip.component.scss'
    ],
  animations: [ textAppear, metaAppear ]
})
export class FilmstripComponent implements OnInit {

  @ViewChild('filmstripHolder', { static: false }) filmstripHolder: ElementRef;

  @Output() videoClick = new EventEmitter<VideoClickEmit>();
  @Output() rightClick = new EventEmitter<RightClickEmit>();

  readonly video = input<ImageElement>(undefined);

  readonly compactView = input<boolean>(undefined);
  readonly darkMode = input<boolean>(undefined);
  readonly elHeight = input<number>(undefined);
  readonly folderPath = input<string>(undefined);
  readonly hoverScrub = input<boolean>(undefined);
  readonly hubName = input<string>(undefined);
  readonly imgHeight = input<number>(undefined);
  readonly largerFont = input<boolean>(undefined);
  readonly showMeta = input<boolean>(undefined);
  readonly showFavorites = input<boolean>(undefined);

  fullFilePath = '';
  filmXoffset = 0;
  indexToShow = 1;

  constructor(
    public filePathService: FilePathService,
    public imageElementService: ImageElementService,
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.fullFilePath = this.filePathService.createFilePath(this.folderPath(), this.hubName(), 'filmstrips', this.video().hash);
  }

  updateFilmXoffset($event) {
    if (this.hoverScrub()) {
      const imgWidth = this.imgHeight() * (16 / 9); // hardcoded aspect ratio
      const containerWidth = this.filmstripHolder.nativeElement.getBoundingClientRect().width;
      const howManyScreensOutsideCutoff = this.video().screens - Math.floor(containerWidth / imgWidth);

      const cursorX = $event.layerX; // cursor's X position inside the filmstrip element
      this.indexToShow = Math.floor(cursorX * (this.video().screens / containerWidth));
      this.filmXoffset = imgWidth * Math.floor(cursorX / (containerWidth / howManyScreensOutsideCutoff));
    }
  }

  toggleHeart(): void {
    this.imageElementService.toggleHeart(this.video().index);
    event.stopPropagation();
  }
}
