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
  remoteSettings: RemoteSettings;
  shortcuts: Map<string, SettingsButtonKey | CustomShortcutAction>;
  vhaFileHistory: HistoryItem[];
  windowSizeAndPosition: any; // TODO -- confirm if I need this
}

export interface RemoteSettings {
  compactView: boolean;
  darkMode: boolean;
  imgsPerRow: number;
  largerText: boolean;
}
