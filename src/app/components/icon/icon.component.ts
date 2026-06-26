import { Component, input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss',
              '../../fonts/icons.scss']
})
export class IconComponent {

  readonly icon = input<string>();

  constructor() { }

}
