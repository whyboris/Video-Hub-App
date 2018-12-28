import { Component, HostListener, Input, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
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

  @ViewChild('filmstripHolder') filmstripHolder: ElementRef;

  @Input() darkMode: boolean;
  @Input() elHeight: number;
  @Input() elWidth: number;
  @Input() fileSize: number;
  @Input() folderPath: string;
  @Input() hoverScrub: boolean;
  @Input() hubName: string;
  @Input() imgHeight: number;
  @Input() imgWidth: number;
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

  filmXoffset: number = 0;

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

  mouseIsMoving($event) {
    const cursorX = $event.layerX;
    const containerWidth = this.filmstripHolder.nativeElement.getBoundingClientRect().width;

    this.filmXoffset = (this.imgHeight * 1.78) * Math.floor(cursorX / (containerWidth / 10));
  }

}
