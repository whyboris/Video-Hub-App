import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-donut',
  templateUrl: './donut.component.html',
  styleUrls: ['./donut.component.scss']
})
export class DonutComponent {

  @Input() darkMode: boolean;
  @Input() percent: number;
  @Input() timeRemaining: number;

  constructor() { }

}
