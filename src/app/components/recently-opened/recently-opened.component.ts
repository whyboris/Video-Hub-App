import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-recently-opened',
  templateUrl: './recently-opened.component.html',
  styleUrls: ['./recently-opened.component.scss']
})
export class RecentlyOpenedComponent {

  @Output() openFromHistory = new EventEmitter<number>();

  @Input() settingsButtons;
  @Input() vhaFileHistory;

  constructor() { }

}
