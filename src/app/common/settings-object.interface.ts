import { AppStateInterface } from './app-state';
import { HistoryItem } from './history-item.interface';

export interface SettingsObject {
  appState: AppStateInterface;
  buttonSettings: any;
  vhaFileHistory: HistoryItem[];
  windowSizeAndPosition: WinBounds;
}

interface WinBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
