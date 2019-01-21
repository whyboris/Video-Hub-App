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

  constructor(
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    // this.video.hash is `undefined` when no screenshot taken -- because of ffmpeg extraction error
    if (this.video.hash === undefined) {
      this.noError = false;
    }
    // hack -- populate hardcoded values -- fix later
    const fileHash = this.video.hash;

    this.pathToVideo = 'vha-' + this.hubName + '/clips/' + fileHash + '.mp4';
    this.poster = 'vha-' + this.hubName + '/thumbnails/' + fileHash + '.jpg';
  }
}
