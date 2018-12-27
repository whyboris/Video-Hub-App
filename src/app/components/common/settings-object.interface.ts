import { AppStateInterface } from './app-state';
import { HistoryItem } from './history-item.interface';

export type SupportedLanguage = 'en' | 'ru';

export interface SettingsObject {
  appState: AppStateInterface;
  buttonSettings: any;
  language: SupportedLanguage;
  vhaFileHistory: HistoryItem[];
  windowSizeAndPosition: WinBounds;
}

interface WinBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
