import { Component, Input, Output, EventEmitter } from '@angular/core';

import { WizardOptions } from '../../../../interfaces/wizard-options.interface';
import { HistoryItem } from '../../../../interfaces/history-item.interface';
import { ImportStage } from '../../../../main-support';

import { historyItemRemove, slowFadeIn } from '../../common/animations';

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: [
    '../settings.scss',
    '../buttons.scss',
    '../search-input.scss',
    '../wizard.scss',
    '../wizard-button.scss',
    './wizard.component.scss'
  ],
  animations: [historyItemRemove, slowFadeIn]
})
export class WizardComponent {

  @Output() clearRecentlyViewedHistory = new EventEmitter<any>();
  @Output() hideWizard                 = new EventEmitter<any>();
  @Output() importFresh                = new EventEmitter<any>();
  @Output() loadFromFile               = new EventEmitter<any>();
  @Output() openFromHistory            = new EventEmitter<number>();
  @Output() removeFromHistory          = new EventEmitter<number>();
  @Output() selectClipSize             = new EventEmitter<string>();
  @Output() selectLengthOfClipSnippets = new EventEmitter<string>();
  @Output() selectNumOfClipSnippets    = new EventEmitter<string>();
  @Output() selectNumOfScreens         = new EventEmitter<string>();
  @Output() selectOutputDirectory      = new EventEmitter<any>();
  @Output() selectScreenshotSize       = new EventEmitter<string>();
  @Output() selectSourceDirectory      = new EventEmitter<any>();
  @Output() setScreensPerVideo         = new EventEmitter<boolean>();

  @Input() canCloseWizard: boolean;
  @Input() demo: boolean;
  @Input() importStage: ImportStage;
  @Input() vhaFileHistory: HistoryItem[];
  @Input() wizard: WizardOptions;

  constructor() { }

    /**
   * Only allow characters and numbers for hub name
   * @param event key press event
   */
  public validateHubName(event: KeyboardEvent): boolean {
    const keyCode = event.charCode;
    if (keyCode === 32) {
      return true;
    } else if (48 <= keyCode && keyCode <= 57) {
      return true;
    } else if (65 <= keyCode && keyCode <= 90) {
      return true;
    } else if (97 <= keyCode && keyCode <= 122) {
      return true;
    }
    return false;
  }

  removeHistoryItem(event: Event, item: number) {
    event.stopPropagation();
    this.removeFromHistory.emit(item);
  }

}
