import { ResolutionString } from '../pipes/resolution-filter.service';

export type StarRating = 0.5 | 1.5 | 2.5 | 3.5;

export interface FinalObject {
  version: number;              // version of this vha file
  addTags?: string[];           // tags to add
  hubName: string;              // the name of the hub -- for recently-opened
  images: ImageElement[];       // see below
  inputDir: string;             // later may support array of many input directories
  numOfFolders: number;         // number of folders
  numberOfScreenshots: number;  // number of screenshots to extract per video (for re-scanning in the future)
  removeTags?: string[];        // tags to remove
  screenshotHeight: number;     // screen shot height -- so when you reimport it remembers your preference
}

export interface ImageElement {
  cleanName: string;             // file name cleaned of dots, underscores,and file extension; for searching
  duration: number;              // duration of film as number
  fileName: string;              // for opening the file
  fileSize: number;              // file size in bytes
  mtime: number;                 // file modification time
  hash: string;                  // used for detecting changed files and as a screenshot identifier
  height: number;                // height of the video
  partialPath: string;           // for opening the file, just prepend the `inputDir`
  screens: number;               // number of screenshots for this file
  stars: StarRating;             // star rating 0 = n/a, otherwise 1, 2, 3
  width: number;                 // width of the video
  // OPTIONAL
  tags?: string[];               // tags associated with this particular file
  showFolder?: boolean;          // when TRUE show the folder -- only changed by folder-view.pipe
  // Stripped out and not saved in the VHA file
  durationDisplay: string;       // displayed duration in X:XX:XX format
  fileSizeDisplay: string;       // displayed as XXXmb or X.Xgb
  index: number;                 // for the `default` sort order
  resBucket: number;             // the resolution category the video falls into (for faster sorting)
  resolution: ResolutionString;  // e.g. `720`, `1080`, `SD`, `HD`
}
