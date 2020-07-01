export type StarRating = 0.5 | 1.5 | 2.5 | 3.5 | 4.5 | 5.5;

// must be heights from true `16:9` resolutions AND divisible by 8
export type AllowedScreenshotHeight = 144 | 216 | 288 | 360 | 432 | 504;

export type ResolutionString = '' | 'SD' | '720' | '720+' | '1080' | '1080+' | '4K' | '4K+';

export interface SourceFolder {
  path: string;
  watch: boolean;
}

export type InputSources = Record<number, SourceFolder>;

export interface FinalObject {
  addTags: string[];             // tags to add
  hubName: string;               // the name of the hub -- for recently-opened
  images: ImageElement[];
  // inputDir: string;           // became `inputDirs` in VHA3
  inputDirs: InputSources;       // map the `inputSource` number to input directory (replaces `inputDir`)
  numOfFolders: number;          // number of folders - is always re-counted when app starts
  removeTags: string[];          // tags to remove
  screenshotSettings: ScreenshotSettings;
  version: number;               // version of this vha file
}

export interface ImageElement {
  cleanName: string;             // file name cleaned of dots, underscores,and file extension; for searching
  duration: number;              // number of seconds - duration of film
  fileName: string;              // full file name with extension - for opening the file
  fileSize: number;              // file size in bytes
  hash: string;                  // used for detecting changed files and as a screenshot identifier
  height: AllowedScreenshotHeight; // height of the video (px)
  inputSource: number;           // corresponding to `inputDirs`
  mtime: number;                 // file modification time
  ctime: number;                 // file creation time
  partialPath: string;           // for opening the file, just prepend the `inputDir` (starts with "/", is "/fldr1/fldr2", or can be "")
  screens: number;               // number of screenshots for this file
  stars: StarRating;             // star rating 0 = n/a, otherwise 1, 2, 3
  timesPlayed: number;           // number of times the file has been launched by VHA
  width: number;                 // width of the video (px)
  // ========================================================================
  // OPTIONAL
  // ------------------------------------------------------------------------
  defaultScreen?: number;        // index of default screenshot to show
  tags?: string[];               // tags associated with this particular file
  year?: number;                 // optional tag to track the year of the video
  // ========================================================================
  // Stripped out and not saved in the VHA file
  // ------------------------------------------------------------------------
  deleted?: boolean;             // toggled after a successful delete of file; removed before saving .vha file
  durationDisplay: string;       // displayed duration in X:XX:XX format
  fileSizeDisplay: string;       // displayed as XXXmb or X.Xgb
  index: number;                 // for the `default` sort order
  resBucket: number;             // the resolution category the video falls into (for faster sorting)
  resolution: ResolutionString;  // e.g. `720`, `1080`, `SD`, `HD`, etc
  selected?: boolean;            // for batch-tagging of videos
}

export interface ImageElementPlus extends ImageElement {
  fullPath: string;              // the full path to video file -- used only in node for extracting meta & thumbnails
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
    height: 144,
    index: 0,
    inputSource: 0,
    mtime: 0,
    ctime: 0,
    partialPath: '',
    resBucket: 0,
    resolution: '',
    screens: 0,
    stars: 0.5,
    timesPlayed: 0,
    width: 0,
  };
}

export interface ScreenshotSettings {
  clipHeight: AllowedScreenshotHeight;
  clipSnippetLength: number;
  clipSnippets: number;        // the number of video snippets in every clip; 0 == no clip extracted
  fixed: boolean;
  height: AllowedScreenshotHeight;
  n: number;
}
