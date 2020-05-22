import { Component, Input } from '@angular/core';
import { ShortcutsService, CustomShortcutAction } from './shortcuts.service';
import { SettingsButtonKey } from '../../common/settings-buttons';

@Component({
  selector: 'app-shortcuts',
  templateUrl: './shortcuts.component.html',
  styleUrls: ['./shortcuts.component.scss']
})
export class ShortcutsComponent {

  @Input() macVersion: boolean;

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
    'darkMode',          // d
    'showAutoTags',      // t
    'showMoreInfo',      // i
    'hideSidebar',       // b
    'toggleMinimalMode', // h
    'startWizard',       // n - space after
    // 'quit',           // w - hardcoded in template
    // 'quit',           // q - hardcoded in template
  ]

  constructor(
    public shortcutService: ShortcutsService
  ) { }

  do(): void {
    console.log('hi');
    this.shortcutService.do();
  }

}
