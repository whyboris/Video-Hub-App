import { AppStateInterface } from '../src/app/common/app-state';
import { HistoryItem } from './history-item.interface';

export interface SettingsObject {
  appState: AppStateInterface;
  buttonSettings: any;
  vhaFileHistory: HistoryItem[];
}

interface WinBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
