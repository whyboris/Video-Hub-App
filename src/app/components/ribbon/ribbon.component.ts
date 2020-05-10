import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { buttonAnimation } from '../../common/animations';

@Component({
  selector: 'app-ribbon',
  templateUrl: './ribbon.component.html',
  styleUrls: [
    '../buttons.scss',
    './ribbon.component.scss'
  ],
  animations: [buttonAnimation]
})
export class RibbonComponent implements OnInit {

  @Output() toggleButton = new EventEmitter<string>();

  @Input() appState;
  @Input() settingsButtons;
  @Input() settingsButtonsGroups;

  constructor() { }

  ngOnInit(): void { }

}
