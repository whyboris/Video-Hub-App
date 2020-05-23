import { AppStateInterface } from '../src/app/common/app-state';
import { CustomShortcutAction } from '../src/app/components/shortcuts/shortcuts.service';
import { HistoryItem } from './history-item.interface';
import { SettingsButtonKey } from '../src/app/common/settings-buttons';

export interface SettingsObject {
  appState: AppStateInterface;
  buttonSettings: any;
  vhaFileHistory: HistoryItem[];
  windowSizeAndPosition: WinBounds;
  shortcuts: Map<string, SettingsButtonKey | CustomShortcutAction>;
}

interface WinBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
