import { Component, Input, Output, EventEmitter, input } from '@angular/core';
import { breadcrumbsAppear, breadcrumbWordAppear } from '../../common/animations';
import type { SettingsButtonsType } from '../../common/settings-buttons';

@Component({
  standalone: false,
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  animations: [breadcrumbWordAppear, breadcrumbsAppear]
})
export class BreadcrumbsComponent {

  @Output() breadcrumbHomeIconClick = new EventEmitter<any>();
  @Output() handleBbreadcrumbClicked = new EventEmitter<number>();

  readonly appState = input(undefined);
  @Input() settingsButtons: SettingsButtonsType;
  readonly folderViewNavigationPath = input(undefined);

  constructor() { }

}
