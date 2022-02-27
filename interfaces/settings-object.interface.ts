import { AppStateInterface } from '../src/app/common/app-state';
import { CustomShortcutAction } from '../src/app/components/shortcuts/shortcuts.service';
import { SettingsButtonKey } from '../src/app/common/settings-buttons';
import { HistoryItem } from './shared-interfaces';
import { ScreenshotSettings } from './final-object.interface';
import { WizardOptions } from './wizard-options.interface';

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
  wizardOptions: WizardOptions;
}

export interface RemoteSettings {
  compactView: boolean;
  darkMode: boolean;
  imgsPerRow: number;
  largerText: boolean;
}
