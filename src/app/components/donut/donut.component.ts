import { Component, input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-donut',
  templateUrl: './donut.component.html',
  styleUrls: ['./donut.component.scss']
})
export class DonutComponent {

  readonly darkMode = input<boolean>();
  readonly percent = input<number>();
  readonly timeRemaining = input<number>();

  constructor() { }

}
