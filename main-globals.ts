export const globals: Globals = {
  version: '2.0.0a',
  vhaFileVersion: 2,
  angularApp: null,               // reference used to send messages back to Angular App
  cancelCurrentImport: false,
  currentlyOpenVhaFile: '',       // OFFICAL DECREE IN NODE WHICH FILE IS CURRENTLY OPEN !!!
  hubName: 'untitled',            // in case user doesn't name their hub any name
  numberOfScreenshots: 10,
  screenShotHeight: 288,
  selectedOutputFolder: '',
  selectedSourceFolder: '',
  winRef: null
};

interface Globals {
  version: string;
  vhaFileVersion: number;
  angularApp: any;
  cancelCurrentImport: boolean;
  currentlyOpenVhaFile: string;
  hubName: string;
  numberOfScreenshots: number;
  screenShotHeight: number;
  selectedOutputFolder: string;
  selectedSourceFolder: string;
  winRef: any;
}
