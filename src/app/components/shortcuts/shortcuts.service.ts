import { Injectable } from '@angular/core';
import type { SettingsButtonKey } from '../../common/settings-buttons';

export type CustomShortcutAction = 'focusOnFile'
  | 'focusOnMagic'
  | 'fuzzySearch'
  | 'quit'
  | 'showAutoTags'
  | 'showTagTray'
  | 'startWizard'
  | 'toggleMinimalMode'
  | 'toggleSettings';

@Injectable({
  providedIn: 'root'
})
export class ShortcutsService {

  regularShortcuts: SettingsButtonKey[] = [
    'compactView',
    'darkMode',
    'hideSidebar',
    'makeLarger',
    'makeSmaller',
    'showClips',
    'showDetails',
    'showDetails2',
    'showFiles',
    'showFilmstrip',
    'showFullView',
    'showMoreInfo',
    'showThumbnails',
    'shuffleGalleryNow',
    'clearAllFilters',
  ];

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
    ['f', 'focusOnFile'],
    ['g', 'focusOnMagic'],
    ['i', 'showMoreInfo'],
    ['k', 'toggleMinimalMode'],
    ['l', 'compactView'],
    ['n', 'startWizard'],
    ['o', 'toggleSettings'],
    ['q', 'quit'], // cannot be changed
    ['r', 'fuzzySearch'],
    ['s', 'shuffleGalleryNow'],
    ['t', 'showAutoTags'],
    ['w', 'quit'], // cannot be changed
    ['x', 'makeLarger'],
    ['y', 'showTagTray'],
    ['z', 'makeSmaller'],
    ['0', 'clearAllFilters'],
  ]);

  // used in template to show key-shortcut connection (excludes quit: `q` and `w`)
  actionToKeyMap: Map<SettingsButtonKey | CustomShortcutAction, string> = new Map([
    ['compactView', 'l'],
    ['darkMode', 'd'],
    ['focusOnFile', 'f'],
    ['focusOnMagic', 'g'],
    ['fuzzySearch', 'r'],
    ['hideSidebar', 'b'],
    ['makeLarger', 'x'],
    ['makeSmaller', 'z'],
    ['showAutoTags', 't'],
    ['showClips', '7'],
    ['showDetails', '4'],
    ['showDetails2', '5'],
    ['showFiles', '6'],
    ['showFilmstrip', '2'],
    ['showFullView', '3'],
    ['showMoreInfo', 'i'],
    ['showTagTray', 'y'],
    ['showThumbnails', '1'],
    ['shuffleGalleryNow', 's'],
    ['startWizard', 'n'],
    ['toggleMinimalMode', 'k'],
    ['toggleSettings', 'o'],
    ['clearAllFilters', '0'],
    // quit -> q
    // quit -> w
  ]);

  constructor() { }

  /**
   * Restore user's preferred keys
   * @param keyToAction
   */
  initializeFromSaved(keyToAction: Object): void {
    this.actionToKeyMap.clear();
    this.keyToActionMap.clear();

    for (const [key, value] of Object.entries(keyToAction)) {
      this.actionToKeyMap.set(value, <any>key);
      this.keyToActionMap.set(<any>key, value);
    }

    // Always ensure '0' maps to 'clearAllFilters'
    if (!this.keyToActionMap.has('0')) {
      this.keyToActionMap.set('0', 'clearAllFilters');
    }
    if (!this.actionToKeyMap.has('clearAllFilters') && !this.keyToActionMap.has('0')) {
      this.actionToKeyMap.set('clearAllFilters', '0');
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
