// Please conform the supported languages exactly to the first two characters from here:
// https://github.com/electron/electron/blob/master/docs/api/locales.md
export type SupportedLanguage = 'en' | 'ru' | 'fr' | 'pt' | 'de' | 'es';

// Let's make these identical to settings buttons!
export type SupportedView = 'showThumbnails'
                          | 'showFilmstrip'
                          | 'showFullView'
                          | 'showDetails'
                          | 'showFiles'
                          | 'showClips';

export const allSupportedViews: SupportedView[] = [
  'showThumbnails',
  'showFilmstrip',
  'showFullView',
  'showDetails',
  'showFiles',
  'showClips',
];

export interface RowNumbers {
  thumbnailSheet: number;
  showThumbnails: number;
  showFilmstrip: number;
  showFullView: number;
  showDetails: number;
  showClips: number;
}

export const defaultImgsPerRow: RowNumbers = {
  thumbnailSheet: 5,
  showThumbnails: 5,
  showFilmstrip: 5,
  showFullView: 5,
  showDetails: 4,
  showClips: 4,
};

export let AppState: AppStateInterface = {
  currentVhaFile: '',     // full path to the .vha file
  currentView: 'showThumbnails',
  currentZoomLevel: 1,
  hubName: '',
  imgsPerRow: defaultImgsPerRow,         // gallery/filmstrip height
  language: 'en',
  menuHidden: false,
  numOfFolders: 0,
  preferredVideoPlayer: '',
  selectedOutputFolder: '',
  selectedSourceFolder: ''
};

export interface AppStateInterface {
  currentVhaFile: string;
  currentView: SupportedView;
  currentZoomLevel: number;
  hubName: string;
  imgsPerRow: RowNumbers;
  language: SupportedLanguage;
  menuHidden: boolean;
  numOfFolders: number;
  preferredVideoPlayer: string;
  selectedOutputFolder: string;
  selectedSourceFolder: string;
}
