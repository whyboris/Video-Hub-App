export let AppState: AppStateInterface = {
  currentVhaFile: '',     // full path to the .vha file
  currentView: 'thumbs',  // can be 'thumbs' | 'filmstrip' | 'files'
  currentZoomLevel: 1,
  hubName: '',
  imgHeight: 100,         // gallery/filmstrip height
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
  menuHidden: boolean;
  numOfFolders: number;
  selectedOutputFolder: string;
  selectedSourceFolder: string;
}
