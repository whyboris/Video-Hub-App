import { ScreenshotSettings } from './interfaces/final-object.interface';

export const globals: Globals = {
  angularApp: null,            // reference used to send messages back to Angular App
  cancelCurrentImport: false,
  currentlyOpenVhaFile: '',    // OFFICAL DECREE IN NODE WHICH FILE IS CURRENTLY OPEN !!!
  debug: false,
  hubName: 'untitled',         // in case user doesn't name their hub any name
  selectedOutputFolder: '',
  selectedSourceFolder: '',
  version: '2.0.0',            // update it and the `package.json` version in tandem before release!
  vhaFileVersion: 2,
  winRef: null,
  screenshotSettings: {
    clipHeight: 144,           // default clip height
    clipSnippetLength: 1,      // the length of each snippet in the clip
    clipSnippets: 0,           // the number of video snippets in every clip; 0 == no clip extracted
    fixed: true,               // true => N screenshots per video; false => 1 screenshot every N minutes
    height: 288,
    n: 10,
  },
};

interface Globals {
  angularApp: any;
  cancelCurrentImport: boolean;
  currentlyOpenVhaFile: string;
  debug: boolean;
  hubName: string;
  screenshotSettings: ScreenshotSettings;
  selectedOutputFolder: string;
  selectedSourceFolder: string;
  version: string;
  vhaFileVersion: number;
  winRef: any;
}
