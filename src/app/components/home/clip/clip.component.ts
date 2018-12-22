import { Component, HostListener, Input, OnInit, OnDestroy } from '@angular/core';
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
export class ClipComponent implements OnInit, OnDestroy {

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

  hover: boolean;
  looper = true;
  noError = true;

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
    // this.imgId is `undefined` when no screenshot taken -- because of ffmpeg extraction error
    if (this.imgId === undefined) {
      this.noError = false;
    }
    // hack -- populate hardcoded values -- fix later
    const fileHash = this.imgId;

    this.imgId = 'vha-' + this.hubName + '/' + fileHash + '.mp4';
    this.poster = 'vha-' + this.hubName + '/' + fileHash + '-first.jpg';

    // this.loop(); // disabled -- can have a toggle in gallery that will feed variable as input into this component that will start
    if (this.randomImage) {
      this.showRandom();
    } else {
      this.showThisOne(0);
    }
  }


  loop(): void {
    const rand = Math.round(Math.random() * (6000 - 500)) + 1500;
    setTimeout(() => {
      this.showRandom();
      if (this.looper) {
        this.loop();
      }
    }, rand);
  }

  showRandom(): void {
    this.showThisOne(Math.floor(Math.random() * 9) + 1 );
  }

  showThisOne(screen: number): void {
  }

  ngOnDestroy() {
    this.looper = false;
  }

}
