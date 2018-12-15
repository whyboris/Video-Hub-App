import { Component, HostListener, Input, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { galleryItemAppear, metaAppear, textAppear } from '../../common/animations';

@Component({
  selector: 'app-gallery-item',
  templateUrl: './preview.component.html',
  styleUrls: [ './preview.component.scss' ],
  animations: [ galleryItemAppear,
                textAppear,
                metaAppear ]
})
export class PreviewComponent implements OnInit, OnDestroy {

  @Input() darkMode: boolean;
  @Input() elHeight: number;
  @Input() elWidth: number;
  @Input() fileSize: number;
  @Input() folderPath: string;
  @Input() hoverScrub: boolean;
  @Input() hubName: string;
  @Input() imgHeight: number;
  @Input() imgId: any;
  @Input() largerFont: boolean;
  @Input() randomImage: boolean;
  @Input() rez: string;
  @Input() showMeta: boolean;
  @Input() time: string;
  @Input() title: string;

  hover: boolean;
  currentlyShowing = 1;
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

    this.imgId = 'vha-' + this.hubName + '/' + fileHash + '.jpg';

    // this.loop(); // disabled -- can have a toggle in gallery that will feed variable as input into this component that will start
    if (this.randomImage) {
      this.showRandom();
    } else {
      this.showThisOne(1);
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
    this.currentlyShowing = screen;
  }

  ngOnDestroy() {
    this.looper = false;
  }

}
