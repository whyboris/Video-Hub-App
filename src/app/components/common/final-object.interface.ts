export interface FinalObject {
  hubName: string;      // the name of the hub -- for recently-opened
  ssSize: number;       // screen shot size -- so when you reimport it remembers your preference
  numOfFolders: number; // number of folders
  inputDir: string;     // later may support array of many input directories
  addTags?: string[];    // tags to add
  removeTags?: string[]; // tags to remove
  images: ImageElement[]; // see below
}

export interface ImageElement {
  partialPath: string; // for opening the file, just prepend the `inputDir`
  fileName: string;    // for opening the file
  cleanName: string;   // file name cleaned of dots, underscores,and file extension; for searching
  hash: string;        // used for detecting changed files and as a screenshot identifier
  duration: number;    // duration of film as number
  resolution: string;  // e.g. `720`, `1080`, `SD`, `HD`
  fileSize: number;    // file size in bytes
}
