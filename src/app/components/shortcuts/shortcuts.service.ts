import { Injectable } from '@angular/core';
import { SettingsButtonKey } from '../../common/settings-buttons';

export type CustomShortcutAction = 'focusOnFile'
  | 'fuzzySearch'
  | 'toggleMinimalMode'
  | 'focusOnMagic'
  | 'quit'
  | 'showAutoTags'
  | 'startWizard'
  | 'toggleSettings';

@Injectable({
  providedIn: 'root'
})
export class ShortcutsService {

  keyboardShortcuts: Map<string, SettingsButtonKey> = new Map([
    ['1', 'showThumbnails'],
    ['2', 'showFilmstrip'],
    ['3', 'showFullView'],
    ['4', 'showDetails'],
    ['5', 'showDetails2'],
    ['6', 'showFiles'],
    ['7', 'showClips'],
    ['b', 'hideSidebar'],
    ['d', 'darkMode'],
    ['i', 'showMoreInfo'],
    ['s', 'shuffleGalleryNow'],
    ['x', 'makeLarger'],
    ['z', 'makeSmaller'],
  ]);

  keyboardShortcutsCustom: Map<string, CustomShortcutAction> = new Map([
    ['f', 'focusOnFile'],
    ['g', 'focusOnMagic'],
    ['h', 'toggleMinimalMode'],
    ['n', 'startWizard'],
    ['o', 'toggleSettings'],
    ['q', 'quit'],
    ['r', 'fuzzySearch'],
    ['t', 'showAutoTags'],
    ['w', 'quit'],
  ]);

  actionToKeyMap: Map<SettingsButtonKey | CustomShortcutAction, string> = new Map([
    ['darkMode', 'd'],
    ['focusOnFile', 'f'],
    ['focusOnMagic', 'g'],
    ['fuzzySearch', 'r'],
    ['hideSidebar', 'b'],
    ['makeLarger', 'x'],
    ['makeSmaller', 'z'],
    // ['quit', 'q'], // hardcoded in template
    // ['quit', 'w'], // hardcoded in template
    ['showAutoTags', 't'],
    ['showClips', '7'],
    ['showDetails', '4'],
    ['showDetails2', '5'],
    ['showFiles', '6'],
    ['showFilmstrip', '2'],
    ['showFullView', '3'],
    ['showMoreInfo', 'i'],
    ['showThumbnails', '1'],
    ['shuffleGalleryNow', 's'],
    ['startWizard', 'n'],
    ['toggleMinimalMode', 'h'],
    ['toggleSettings', 'o'],
  ])

  constructor() { }

  do(): void {
    console.log('hi!!');
  }

}
