import type { ScreenshotSettings, InputSources } from '../interfaces/final-object.interface';

// For release, update 4 values:                                                                          <---- !!! RELEASE !!!
//
// `demo: true,`                 -- below
// `version: 'X.X.X',`           -- below
// `productName: "... Demo'`     -- package.json
// `"version": "X.X.X",`         -- package.json

export const GLOBALS: VhaGlobals = {
  angularApp: null,            // reference used to send messages back to Angular App
  currentlyOpenVhaFile: '',    // OFFICAL DECREE IN NODE WHICH FILE IS CURRENTLY OPEN !!!
  debug: false,
  demo: false,                 // change to `true` during release                                         <---- !!! RELEASE !!!
  hubName: 'untitled',         // in case user doesn't name their hub any name
  macVersion: false,           // auto updated by `main.ts`
  readyToQuit: false,          // hack to quit gracefully
  selectedOutputFolder: '',
  selectedSourceFolders: {},
  settingsPath: '',            // to differentiate between standard & Windows Portable settings location
  version: '3.2.1',            // see instructions above to update `package.json` in tandem               <---- !!! RELEASE !!!!
  vhaFileVersion: 3,
  winRef: null,
  screenshotSettings: {
    clipHeight: 144,           // default clip height
    clipSnippetLength: 1,      // the length of each snippet in the clip
    clipSnippets: 0,           // the number of video snippets in every clip; 0 == no clip extracted
    fixed: true,               // true => N screenshots per video; false => 1 screenshot every N minutes
    height: 288,
    n: 10,
  },
  additionalExtensions: [],
};

export interface VhaGlobals {
  additionalExtensions: string[];
  angularApp: any;
  currentlyOpenVhaFile: string;
  debug: boolean;
  demo: boolean;
  hubName: string;
  macVersion: boolean;
  readyToQuit: boolean;
  screenshotSettings: ScreenshotSettings;
  selectedOutputFolder: string;
  selectedSourceFolders: InputSources;
  settingsPath: string;
  version: string;
  vhaFileVersion: number;
  winRef: any;
}
