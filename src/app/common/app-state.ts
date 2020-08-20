import { SortType } from '../pipes/sorting.pipe';
import { SupportedView } from '../../../interfaces/shared-interfaces';

// Please conform the supported languages exactly to the first two characters from here:
// https://github.com/electron/electron/blob/master/docs/api/locales.md
export type SupportedLanguage =
  'en'
| 'ar'
| 'bn'
| 'cs'
| 'de'
| 'es'
| 'fr'
| 'hi'
| 'it'
| 'ja'
| 'ko'
| 'ms'
| 'pt'
| 'ru'
| 'zh'
| 'uk';

export interface RowNumbers {
  thumbnailSheet: number;
  showThumbnails: number;
  showFilmstrip: number;
  showFullView: number;
  showDetails: number;
  showDetails2: number;
  showClips: number;
}

export const DefaultImagesPerRow: RowNumbers = {
  thumbnailSheet: 5,
  showThumbnails: 5,
  showFilmstrip: 5,
  showFullView: 5,
  showDetails: 4,
  showDetails2: 4,
  showClips: 4,
};

export const AppState: AppStateInterface = { // AppState is saved into `settings.json` so it persists
  currentSort: 'default',
  currentVhaFile: '',  // full path to the .vha2 file -- TODO: rename to `currentVhaFilePath` in VHA3
  currentView: 'showThumbnails',
  currentZoomLevel: 1,
  hubName: '',
  imgsPerRow: DefaultImagesPerRow,
  language: 'en',
  menuHidden: false,
  numOfFolders: 0,
  preferredVideoPlayer: '',
  videoPlayerArgs: '',
  addtionalExtensions: '',
  selectedOutputFolder: '',
  sortTagsByFrequency: false
};

export interface AppStateInterface {
  currentSort: SortType;
  currentVhaFile: string;
  currentView: SupportedView;
  currentZoomLevel: number;
  hubName: string;
  imgsPerRow: RowNumbers;
  language: SupportedLanguage;
  menuHidden: boolean;
  numOfFolders: number;
  preferredVideoPlayer: string;
  videoPlayerArgs: string;
  addtionalExtensions: string;
  selectedOutputFolder: string;
  sortTagsByFrequency: boolean; // when `false` sort tags alphabetically
}
