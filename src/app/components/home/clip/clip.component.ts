import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
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

  @Input() darkMode: boolean;
  @Input() elHeight: number;
  @Input() elWidth: number;
  @Input() fileSize: number;
  @Input() folderPath: string;
  @Input() hoverScrub: boolean;
  @Input() hubName: string;
  @Input() imgHeight: number;
  @Input() imgId: any;
  @Input() poster: any;
  @Input() largerFont: boolean;
  @Input() randomImage: boolean;
  @Input() rez: string;
  @Input() showMeta: boolean;
  @Input() time: string;
  @Input() title: string;
  @Input() autoplay: boolean;

  hover: boolean;
  noError = true;

  constructor(
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    // this.imgId is `undefined` when no screenshot taken -- because of ffmpeg extraction error
    if (this.imgId === undefined) {
      this.noError = false;
    }
    // hack -- populate hardcoded values -- fix later
    const fileHash = this.imgId;

    this.imgId = 'vha-' + this.hubName + '/' + fileHash + '.mp4';
    this.poster = 'vha-' + this.hubName + '/' + fileHash + '-first.jpg';
  }
}
