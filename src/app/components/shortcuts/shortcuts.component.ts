import { Component, Input, HostListener } from '@angular/core';
import { ShortcutsService, CustomShortcutAction } from './shortcuts.service';
import { SettingsButtonKey } from '../../common/settings-buttons';

@Component({
  selector: 'app-shortcuts',
  templateUrl: './shortcuts.component.html',
  styleUrls: ['./shortcuts.component.scss']
})
export class ShortcutsComponent {

  @Input() macVersion: boolean;

  isReadyToReceiveKey: boolean = false;
  shortcutToChange: SettingsButtonKey | CustomShortcutAction;

  @HostListener('window:keydown', ['$event'])
  handleThisEvent(event: KeyboardEvent) {
    if (this.isReadyToReceiveKey) {
      this.shortcutService.setNewKeyBinding(event.key, this.shortcutToChange);
      this.isReadyToReceiveKey = false;
      this.shortcutToChange = undefined;
    }
  }

  // Do not alphabetize!
  shortcutsInOrder: (SettingsButtonKey | CustomShortcutAction)[] = [
    'showThumbnails',    // 1
    'showFilmstrip',     // 2
    'showFullView',      // 3
    'showDetails',       // 4
    'showDetails2',      // 5
    'showFiles',         // 6
    'showClips',         // 7 - space after

    'focusOnFile',       // f
    'focusOnMagic',      // g
    'fuzzySearch',       // r - space after

    'makeSmaller',       // z
    'makeLarger',        // x
    'shuffleGalleryNow', // s - space after

    'toggleSettings',    // o
    'hideSidebar',       // b
    'showTagTray',       // y
    'toggleMinimalMode', // k
    'showAutoTags',      // t
    'showMoreInfo',      // i
    'darkMode',          // d
    'startWizard',       // n - space after

    // 'quit',           // w - hardcoded in template
    // 'quit',           // q - hardcoded in template
  ]

  constructor(
    public shortcutService: ShortcutsService
  ) { }

  changeThisShortcut(shortcutToChange: SettingsButtonKey | CustomShortcutAction): void {
    this.shortcutToChange = shortcutToChange;
    this.isReadyToReceiveKey = true;
  }

}
