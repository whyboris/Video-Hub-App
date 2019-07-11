import { Component, HostListener, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { ImageElement } from '../../common/final-object.interface';

import { galleryItemAppear, metaAppear, textAppear } from '../../common/animations';

@Component({
  selector: 'app-clip-item',
  templateUrl: './clip.component.html',
  styleUrls: [ './clip.component.scss' ],
  animations: [ galleryItemAppear,
                textAppear,
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

  folderPosterPaths: string[] = [];
  folderThumbPaths: string[] = [];
  hover: boolean;
  noError = true;
  pathToVideo: string = '';
  poster: string;

  constructor(
    public sanitizer: DomSanitizer
  ) { }

  @HostListener('mouseenter') onMouseEnter() {
      this.hover = true;
  }
  @HostListener('mouseleave') onMouseLeave() {
      this.hover = false;
  }

  ngOnInit() {
    // multiple hashes?
    if (this.video.hash.indexOf(':') !== -1) {
      const hashes = this.video.hash.split(':');

      this.shuffle(hashes).slice(0, 4).forEach((hash) => {
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

  /**
   * Hack to mute the video by changing the volume to 0 or 1
   */
  shouldMute(): number {
    return this.forceMute ? 0 : 1;
  }

  shuffle(a) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
  }
}
