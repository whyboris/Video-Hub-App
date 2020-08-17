import { ScreenshotSettings, InputSources } from '../interfaces/final-object.interface';

export const GLOBALS: VhaGlobals = {
  angularApp: null,            // reference used to send messages back to Angular App
  currentlyOpenVhaFile: '',    // OFFICAL DECREE IN NODE WHICH FILE IS CURRENTLY OPEN !!!
  debug: false,
  hubName: 'untitled',         // in case user doesn't name their hub any name
  selectedOutputFolder: '',
  selectedSourceFolders: {},
  settingsPath: '',            // to differentiate between standard & Windows Portable settings location
  version: '3.0.0',            // update it and the `package.json` version in tandem before release!
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
  angularApp: any;
  currentlyOpenVhaFile: string;
  debug: boolean;
  hubName: string;
  screenshotSettings: ScreenshotSettings;
  selectedOutputFolder: string;
  selectedSourceFolders: InputSources;
  settingsPath: string;
  version: string;
  vhaFileVersion: number;
  winRef: any;
  additionalExtensions: string[];
}
