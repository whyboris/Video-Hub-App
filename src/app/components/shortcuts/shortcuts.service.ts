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

  constructor() { }

  do(): void {
    console.log('hi!!');
  }

}
