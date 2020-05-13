import { Component, Input, Output, EventEmitter } from '@angular/core';
import { breadcrumbsAppear, breadcrumbWordAppear } from '../../common/animations';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  animations: [breadcrumbWordAppear, breadcrumbsAppear]
})
export class BreadcrumbsComponent {

  @Output() breadcrumbHomeIconClick = new EventEmitter<any>();
  @Output() handleBbreadcrumbClicked = new EventEmitter<number>();

  @Input() appState;
  @Input() settingsButtons;
  @Input() folderViewNavigationPath;

  constructor() { }

}
