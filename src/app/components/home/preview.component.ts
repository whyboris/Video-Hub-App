import { Component, HostListener, Input, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-gallery-item',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit, OnDestroy {

  @Input() stuff: any;
  @Input() folderPath: string;

  hover: boolean;
  currentlyShowing = 1;
  looper = true;

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

    // hack -- populate hardcoded values -- fix later
    const fileNumber = this.stuff;
    this.stuff = [];

    for (let i = 0; i < 10; i++) {
      this.stuff[i] = 'boris/' + fileNumber + '-' + (i + 1) + '.jpg';
    }

    this.loop();
  }


  loop(): void {
    const rand = Math.round(Math.random() * (6000 - 500)) + 1500;
    setTimeout(() => {
      this.showRandom();
      if (this.looper) {
        // this.loop();
      }
    }, rand);
  }

  showRandom(): void {
    console.log('random');
    this.showThisOne(Math.floor(Math.random() * 9) + 1 );
  }

  showThisOne(screen: number): void {
    this.currentlyShowing = screen;
  }

  ngOnDestroy() {
    this.looper = false;
  }

}
