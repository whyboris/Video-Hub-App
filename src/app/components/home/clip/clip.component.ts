import { Component, Input, OnInit } from '@angular/core';
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

  @Input() video: ImageElement;

  @Input() autoplay: boolean;
  @Input() darkMode: boolean;
  @Input() elHeight: number;
  @Input() elWidth: number;
  @Input() folderPath: string;
  @Input() hubName: string;
  @Input() imgHeight: number;
  @Input() largerFont: boolean;
  @Input() showMeta: boolean;

  hover: boolean;
  noError = true;
  poster: string;
  pathToVideo: string = '';

  folderThumbPaths = [];
  folderPosterPaths = [];
  numberOfThumbs = 0;

  constructor(
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    // multiple hashes?
    if (this.video.hash.indexOf(':') !== -1) {
      const hashes = this.video.hash.split(':');

      this.shuffle(hashes).slice(0, 4).forEach((hash) => {
        this.folderThumbPaths.push('vha-' + this.hubName + '/clips/' + hash + '.mp4');
        this.folderPosterPaths.push('vha-' + this.hubName + '/thumbnails/' + hash + '.jpg');
      });
      this.numberOfThumbs = this.folderThumbPaths.length;
    } else {
      // this.video.hash is `undefined` when no screenshot taken -- because of ffmpeg extraction error
      if (this.video.hash === undefined) {
        this.noError = false;
      }
      // hack -- populate hardcoded values -- fix later
      const fileHash = this.video.hash;

      this.pathToVideo = 'vha-' + this.hubName + '/clips/' + fileHash + '.mp4';
      this.poster = 'vha-' + this.hubName + '/thumbnails/' + fileHash + '.jpg';
      this.folderThumbPaths.push(this.pathToVideo);
      this.folderPosterPaths.push(this.poster);
      this.numberOfThumbs = 1;
    }
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
