import { Component, HostListener, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { ImageElement } from '../../common/final-object.interface';

import { metaAppear, textAppear } from '../../common/animations';

@Component({
  selector: 'app-clip-item',
  templateUrl: './clip.component.html',
  styleUrls: [ './clip.component.scss' ],
  animations: [ textAppear,
                metaAppear ]
})
export class ClipComponent implements OnInit {

  @Output() videoClick = new EventEmitter<object>();
  @Output() sheetClick = new EventEmitter<object>();

  @Input() video: ImageElement;

  @Input() autoplay: boolean;
  @Input() darkMode: boolean;
  @Input() elHeight: number;
  @Input() elWidth: number;
  @Input() folderPath: string;
  @Input() hubName: string;
  @Input() imgHeight: number;
  @Input() largerFont: boolean;
  @Input() forceMute: boolean;
  @Input() showMeta: boolean;

  appInFocus: boolean = true;
  folderPosterPaths: string[] = [];
  folderThumbPaths: string[] = [];
  hover: boolean;
  noError = true;
  pathToVideo: string = '';
  poster: string;

  constructor(
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

  ngOnInit() {
    // multiple hashes?
    if (this.video.hash.indexOf(':') !== -1) {
      const hashes = this.video.hash.split(':');

      hashes.slice(0, 4).forEach((hash) => {
        this.folderThumbPaths.push('vha-' + this.hubName + '/clips/' + hash + '.mp4');
        this.folderPosterPaths.push('vha-' + this.hubName + '/thumbnails/' + hash + '.jpg');
      });
    } else {
      if (this.video.hash === undefined) {
        this.noError = false;
      }
      // hack -- populate hardcoded values -- fix later
      const fileHash = this.video.hash;

      this.pathToVideo = 'vha-' + this.hubName + '/clips/' + fileHash + '.mp4';
      this.poster = 'vha-' + this.hubName + '/thumbnails/' + fileHash + '.jpg';
      this.folderThumbPaths.push(this.pathToVideo);
      this.folderPosterPaths.push(this.poster);
    }
  }

}
