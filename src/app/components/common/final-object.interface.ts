import { ResolutionString } from '../pipes/resolution-filter.service';

export type StarRating = 0 | 1 | 2 | 3;

export interface FinalObject {
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
  hash: string;                  // used for detecting changed files and as a screenshot identifier
  numOfScreenshots: number;      // number of screenshots for this file
  partialPath: string;           // for opening the file, just prepend the `inputDir`
  resolution: ResolutionString;  // e.g. `720`, `1080`, `SD`, `HD`
  stars: StarRating;             // star rating 0 = n/a, otherwise 1, 2, 3
  tags?: string[];               // tags associated with this particular file
}
