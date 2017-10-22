import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-filmstrip-item',
  templateUrl: './filmstrip.component.html',
  styleUrls: ['./filmstrip.component.scss']
})
export class FilmstripComponent implements OnInit {

  @Input() stuff: any;
  @Input() folderPath: string;
  @Input() width: number;

  constructor(public sanitizer: DomSanitizer) {}

  ngOnInit() {

    // hack -- populate hardcoded values -- fix later
    const fileNumber = this.stuff;
    this.stuff = [];
    this.stuff[0] = 'boris/' + fileNumber + '-1.jpg';
    this.stuff[1] = 'boris/' + fileNumber + '-2.jpg';
    this.stuff[2] = 'boris/' + fileNumber + '-3.jpg';
    this.stuff[3] = 'boris/' + fileNumber + '-4.jpg';
    this.stuff[4] = 'boris/' + fileNumber + '-5.jpg';
  }

}
