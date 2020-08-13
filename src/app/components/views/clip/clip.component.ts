import { Component, HostListener, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { FilePathService } from '../file-path.service';

import { ImageElement } from '../../../../../interfaces/final-object.interface';
import { RightClickEmit, VideoClickEmit, DoubleClickVideoEmit } from '../../../../../interfaces/shared-interfaces';

import { metaAppear, textAppear } from '../../../common/animations';

@Component({
  selector: 'app-clip-item',
  templateUrl: './clip.component.html',
  styleUrls: [
      '../clip-and-preview.scss',
      '../time-and-rez.scss',
      './clip.component.scss',
      '../selected.scss'
    ],
  animations: [ textAppear,
                metaAppear ]
})
export class ClipComponent implements OnInit {

  @Output() rightClick = new EventEmitter<RightClickEmit>();
  @Output() sheetClick = new EventEmitter<any>(); // does not emit data of any kind
  @Output() videoClick = new EventEmitter<VideoClickEmit>();
  @Output() doubleClick = new EventEmitter<DoubleClickVideoEmit>();

  @Input() video: ImageElement;

  @Input() autoplay: boolean;
  @Input() compactView: boolean;
  @Input() darkMode: boolean;
  @Input() elHeight: number;
  @Input() elWidth: number;
  @Input() folderPath: string;
  @Input() forceMute: boolean;
  @Input() defaultThumbnailMode: boolean;
  @Input() returnToFirstScreenshot: boolean;
  @Input() hubName: string;
  @Input() imgHeight: number;
  @Input() largerFont: boolean;
  @Input() showMeta: boolean;

  appInFocus: boolean = true;
  folderPosterPaths: string[] = [];
  folderThumbPaths: string[] = [];
  hover: boolean;
  noError = true;
  pathToVideo: string = '';
  poster: string;
  posterFolderType: any = 'clips';

  constructor(
    public filePathService: FilePathService,
    public sanitizer: DomSanitizer,
    public cd: ChangeDetectorRef
  ) { }

  @HostListener('mouseenter') onMouseEnter() {
    this.hover = true;
  }
  @HostListener('mouseleave') onMouseLeave() {
    this.hover = false;
  }
  @HostListener('window:blur', ['$event'])
  onBlur(event: any): void {
    this.appInFocus = false;
  }
  @HostListener('window:focus', ['$event'])
  onFocus(event: any): void {
    this.appInFocus = true;
  }

  stopPreview(event): any {
    if (this.defaultThumbnailMode && this.returnToFirstScreenshot) {
      event.target.load(); // Reload original thumbnail
    } else {
      event.target.pause();
    }
  }

  ngOnInit() {

    if (this.defaultThumbnailMode) {
      this.posterFolderType = 'thumbnails';
    }

    // multiple hashes?
    if (this.video.hash.indexOf(':') !== -1) {
      const hashes = this.video.hash.split(':');

      hashes.slice(0, 4).forEach((hash) => {
        this.folderThumbPaths.push( this.filePathService.createFilePath(this.folderPath, this.hubName, 'clips', hash, true));
        this.folderPosterPaths.push(this.filePathService.createFilePath(this.folderPath, this.hubName, this.posterFolderType, hash));
      });
    } else {
      if (this.video.hash === undefined) {
        this.noError = false;
      }
      this.pathToVideo = this.filePathService.createFilePath(this.folderPath, this.hubName, 'clips', this.video.hash, true);
      this.poster =      this.filePathService.createFilePath(this.folderPath, this.hubName, this.posterFolderType, this.video.hash);

      this.folderThumbPaths.push(this.pathToVideo);
      this.folderPosterPaths.push(this.poster);
    }
  }

}
