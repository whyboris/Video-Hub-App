import { ResolutionString } from '../pipes/resolution-filter.service';
import { ScreenshotSettings } from '../../../main-globals';

export type StarRating = 0.5 | 1.5 | 2.5 | 3.5 | 4.5 | 5.5;

export interface FinalObject {
  addTags?: string[];           // tags to add
  hubName: string;              // the name of the hub -- for recently-opened
  images: ImageElement[];       // see below
  inputDir: string;             // later may support array of many input directories
  numOfFolders: number;         // number of folders
  removeTags?: string[];        // tags to remove
  screenshotSettings: ScreenshotSettings;
  version: number;              // version of this vha file
}

export interface ImageElement {
  cleanName: string;             // file name cleaned of dots, underscores,and file extension; for searching
  duration: number;              // number of seconds - duration of film
  fileName: string;              // full file name with extension - for opening the file
  fileSize: number;              // file size in bytes
  hash: string;                  // used for detecting changed files and as a screenshot identifier
  height: number;                // height of the video (px)
  mtime: number;                 // file modification time
  partialPath: string;           // for opening the file, just prepend the `inputDir` (starts with "/", is "/fldr1/fldr2", or can be "")
  screens: number;               // number of screenshots for this file
  stars: StarRating;             // star rating 0 = n/a, otherwise 1, 2, 3
  timesPlayed: number;           // number of times the file has been launched by VHA
  width: number;                 // width of the video (px)
  // ========================================================================
  // OPTIONAL
  // ------------------------------------------------------------------------
  tags?: string[];               // tags associated with this particular file
  year?: number;                 // optional tag to track the year of the video
  // ========================================================================
  // Stripped out and not saved in the VHA file
  // ------------------------------------------------------------------------
  durationDisplay: string;       // displayed duration in X:XX:XX format
  fileSizeDisplay: string;       // displayed as XXXmb or X.Xgb
  index: number;                 // for the `default` sort order
  resBucket: number;             // the resolution category the video falls into (for faster sorting)
  resolution: ResolutionString;  // e.g. `720`, `1080`, `SD`, `HD`
}

// Use this to create a new ImageElement if needed
export function NewImageElement(): ImageElement {
  return {
    cleanName: '',
    duration: 0,
    durationDisplay: '',
    fileName: '',
    fileSize: 0,
    fileSizeDisplay: '',
    hash: '',
    height: 0,
    index: 0,
    mtime: 0,
    partialPath: '',
    resBucket: 0,
    resolution: '',
    screens: 0,
    stars: 0.5,
    timesPlayed: 0,
    width: 0,
  };
}
