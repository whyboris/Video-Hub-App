import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss',
              '../fonts/icons.scss']
})
export class IconComponent {

  @Input() icon: string;

  constructor() { }

}
