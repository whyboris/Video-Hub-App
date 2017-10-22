import { Component, HostListener, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-gallery-item',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {

  @Input() stuff: any;
  @Input() folderPath: string;

  hover: boolean;
  currentlyShowing = 1;

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
  }

  showThisOne(screen: number): void {
    this.currentlyShowing = screen;
  }

}
