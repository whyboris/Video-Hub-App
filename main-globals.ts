export const globals: Globals = {
  angularApp: null,               // reference used to send messages back to Angular App
  cancelCurrentImport: false,
  currentlyOpenVhaFile: '',       // OFFICAL DECREE IN NODE WHICH FILE IS CURRENTLY OPEN !!!
  hubName: 'untitled',            // in case user doesn't name their hub any name
  numberOfScreenshots: 10,
  screenShotHeight: 200,
  selectedOutputFolder: '',
  selectedSourceFolder: ''
};

interface Globals {
  angularApp: any;
  cancelCurrentImport: boolean;
  currentlyOpenVhaFile: string;
  hubName: string;
  numberOfScreenshots: number;
  screenShotHeight: number;
  selectedOutputFolder: string;
  selectedSourceFolder: string;
}
