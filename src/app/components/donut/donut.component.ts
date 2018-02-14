import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-donut',
  templateUrl: './donut.component.html',
  styleUrls: ['./donut.component.scss']
})
export class DonutComponent {

  @Input() score: number;
  @Input() darkMode: boolean;

  constructor() { }

}
