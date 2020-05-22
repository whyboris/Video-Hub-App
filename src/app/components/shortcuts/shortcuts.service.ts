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

  regularShortcuts: SettingsButtonKey[] = [
    'showThumbnails',
    'showFilmstrip',
    'showFullView',
    'showDetails',
    'showDetails2',
    'showFiles',
    'showClips',
    'hideSidebar',
    'darkMode',
    'showMoreInfo',
    'shuffleGalleryNow',
    'makeLarger',
    'makeSmaller',
  ];

  customShortcuts: CustomShortcutAction[] = [
    'focusOnFile',
    'focusOnMagic',
    'toggleMinimalMode',
    'startWizard',
    'toggleSettings',
    'quit',
    'fuzzySearch',
    'showAutoTags',
    'quit',
  ]

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

  // combine both -- used for rendering template
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
    this.setNewKeyBinding('x', 'darkMode');
  }


  setNewKeyBinding(key: string, action: (SettingsButtonKey | CustomShortcutAction)): void {

    if (this.actionToKeyMap.has(action)) {
      this.actionToKeyMap.delete(action);
    }

    if (this.keyboardShortcuts.has(key)) {
      this.keyboardShortcuts.delete(key);
    } else if (this.keyboardShortcutsCustom.has(key)) {
      this.keyboardShortcutsCustom.delete(key);
    }

    if (this.customShortcuts.includes(<CustomShortcutAction>action)) {
      this.keyboardShortcutsCustom.set(key, <CustomShortcutAction>action);
      this.actionToKeyMap.set(action, key);
    } else if (this.regularShortcuts.includes(<SettingsButtonKey>action)) {
      this.keyboardShortcuts.set(key, <SettingsButtonKey>action);
      this.actionToKeyMap.set(action, key);
    }

  }

}
