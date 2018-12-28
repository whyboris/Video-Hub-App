export interface FinalObject {
  hubName: string;      // the name of the hub -- for recently-opened
  ssSize: number;       // screen shot size -- so when you reimport it remembers your preference
  numOfFolders: number; // number of folders
  inputDir: string;     // later may support array of many input directories
  addTags?: string[];    // tags to add
  removeTags?: string[]; // tags to remove
  images: ImageElement[]; // see below
}

export type ImageElement = [string, string, string, string, number, string, number, number];
/*                            0       1       2       3       4       5       6       7
-------------------------------------------------------------------------------------------------------
index   type      description                   more info
-----   ------    -------------------------------------------------------------------------------------
  0     string    partial path to file,    <--- for opening the file, just prepend the `inputDir`
  1     string    full original file name, <--- for opening the file
  2     string    file name cleaned
                  of dots, underscores,
                  and file extension       <--- for searching
  3     string    hash of the file         <--- used for detecting changed files and as a screenshot
                                                identifier
  4     number    duration                 <-- duration of film as number
  5     string    depicting size           <-- e.g. `720`, `1080`, `SD`, `HD`
  6     number    width of screenshot      <-- e.g 124 etc                      !!! DEPRECATED -- TO BE REMOVED !!!
  7     number    fileSize in megabytes    <-- rounded to nearest MB

*/
