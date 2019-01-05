export type SupportedLanguage = 'en' | 'ru';
// Please conform the supported languages exactly to the first two characters from here:
// https://github.com/electron/electron/blob/master/docs/api/locales.md

export let AppState: AppStateInterface = {
  currentVhaFile: '',     // full path to the .vha file
  currentView: 'thumbs',  // can be 'thumbs' | 'filmstrip' | 'files'
  currentZoomLevel: 1,
  hubName: '',
  imgHeight: 100,         // gallery/filmstrip height
  language: 'en',
  menuHidden: false,
  numOfFolders: 0,
  selectedOutputFolder: '',
  selectedSourceFolder: ''
};

export interface AppStateInterface {
  currentVhaFile: string;
  currentView: string;
  currentZoomLevel: number;
  hubName: string;
  imgHeight: number;
  language: SupportedLanguage;
  menuHidden: boolean;
  numOfFolders: number;
  selectedOutputFolder: string;
  selectedSourceFolder: string;
}
