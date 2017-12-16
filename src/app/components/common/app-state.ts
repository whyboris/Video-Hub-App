export let AppState = {

  numOfFolders: 0,

  selectedOutputFolder: '',
  selectedSourceFolder: '',
  currentView: 'thumbs', // can be 'thumbs' | 'filmstrip' | 'files'

  buttonsInView: true,
  menuHidden: false,
  numberToShow: 20,

  imgHeight: 100  // store the state of the preview in settings
}
