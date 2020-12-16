import { AppStateInterface } from '../src/app/common/app-state';
import { CustomShortcutAction } from '../src/app/components/shortcuts/shortcuts.service';
import { SettingsButtonKey } from '../src/app/common/settings-buttons';
import { HistoryItem } from './shared-interfaces';

export interface SettingsButtonSavedProperties {
  hidden: boolean;
  toggled: boolean;
}

export interface SettingsObject {
  appState: AppStateInterface;
  buttonSettings: Record<SettingsButtonKey, SettingsButtonSavedProperties>;
  shortcuts: Map<string, SettingsButtonKey | CustomShortcutAction>;
  vhaFileHistory: HistoryItem[];
  windowSizeAndPosition: any; // TODO -- confirm if I need this
}

interface WinBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
