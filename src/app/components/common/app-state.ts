// Please conform the supported languages exactly to the first two characters from here:
// https://github.com/electron/electron/blob/master/docs/api/locales.md
export type SupportedLanguage = 'en' | 'ru' | 'fr';

// Let's make these identical to settings buttons!
export type SupportedView = 'showThumbnails'
                          | 'showFilmstrip'
                          | 'showFullView'
                          | 'showDetails'
                          | 'showFiles'
                          | 'showFoldersOnly'
                          | 'showClips';

export const allSupportedViews: SupportedView[] = [
  'showThumbnails',
  'showFilmstrip',
  'showFullView',
  'showDetails',
  'showFiles',
  'showFoldersOnly',
  'showClips',
];

export interface ImageHeights {
  thumbnailSheet: number;
  showThumbnails: number;
  showFilmstrip: number;
  showFullView: number;
  showDetails: number;
  showClips: number;
}

export const defaultHeights: ImageHeights = {
  thumbnailSheet: 144,
  showThumbnails: 144,
  showFilmstrip: 144,
  showFullView: 144,
  showDetails: 144,
  showClips: 144,
};

export let AppState: AppStateInterface = {
  currentVhaFile: '',     // full path to the .vha file
  currentView: 'showThumbnails',
  currentZoomLevel: 1,
  hubName: '',
  imgHeight: defaultHeights,         // gallery/filmstrip height
  language: 'en',
  menuHidden: false,
  numOfFolders: 0,
  selectedOutputFolder: '',
  selectedSourceFolder: ''
};

export interface AppStateInterface {
  currentVhaFile: string;
  currentView: SupportedView;
  currentZoomLevel: number;
  hubName: string;
  imgHeight: ImageHeights;
  language: SupportedLanguage;
  menuHidden: boolean;
  numOfFolders: number;
  selectedOutputFolder: string;
  selectedSourceFolder: string;
}
