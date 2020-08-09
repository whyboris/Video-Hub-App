import { Injectable } from '@angular/core';
import { SettingsButtonKey } from '../../common/settings-buttons';

export type CustomShortcutAction = 'focusOnFile'
  | 'fuzzySearch'
  | 'toggleMinimalMode'
  | 'focusOnMagic'
  | 'quit'
  | 'showAutoTags'
  | 'showTagTray'
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
    'showTagTray',
    'showAutoTags',
    'quit',
  ]

  // the mapping used in `home.component` in `handleKeyboardEvent`
  keyToActionMap: Map<string, SettingsButtonKey | CustomShortcutAction> = new Map([
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
    ['f', 'focusOnFile'],
    ['g', 'focusOnMagic'],
    ['h', 'toggleMinimalMode'],
    ['n', 'startWizard'],
    ['o', 'toggleSettings'],
    ['q', 'quit'], // cannot be changed
    ['r', 'fuzzySearch'],
    ['t', 'showAutoTags'],
    ['y', 'showTagTray'],
    ['w', 'quit'], // cannot be changed
  ]);

  // used in template to show key-shortcut connection (excludes quit: `q` and `w`)
  actionToKeyMap: Map<SettingsButtonKey | CustomShortcutAction, string> = new Map([
    ['darkMode', 'd'],
    ['focusOnFile', 'f'],
    ['focusOnMagic', 'g'],
    ['fuzzySearch', 'r'],
    ['hideSidebar', 'b'],
    ['makeLarger', 'x'],
    ['makeSmaller', 'z'],
    ['showAutoTags', 't'],
    ['showTagTray', 'y'],
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

  /**
   * Restore user's preferred keys
   * @param keyToAction
   */
  initializeFromSaved(keyToAction: Object): void {
    this.actionToKeyMap.clear();
    this.keyToActionMap.clear();

    for (let [key, value] of Object.entries(keyToAction)) {
      this.actionToKeyMap.set(value, <any>key);
      this.keyToActionMap.set(<any>key, value);
    }
  }

  /**
   * Create new key binding
   * removes old key binding too
   */
  setNewKeyBinding(key: string, action: (SettingsButtonKey | CustomShortcutAction)): void {

    if (!key.match(/^[0-9a-z]/)) { // only allow alphanumeric
      return;
    }

    if (key === 'w' || key === 'q') { // prevent system changing default close shortcut
      return;
    }

    const oldKey = this.actionToKeyMap.get(action);
    const oldAction = this.keyToActionMap.get(key);

    this.keyToActionMap.set(key, action);
    this.actionToKeyMap.set(action, key);

    this.keyToActionMap.delete(oldKey);
    this.actionToKeyMap.delete(oldAction);

  }

}
