export interface FinalObject {
  inputDir: string;   // later may support array of many input directories
  outputDir: string;  // always just one -- for screenshots and JSON file
  images: Array<any>; // see below
}

/*
Each item in the images array is formatted thus:

  [
0    'string: partial path to file',    <--- for opening the file, just prepend the `inputDir`
1    'string: full original file name', <--- for opening the file
2    'string: file name cleaned of dots, underscores, and file extension' <--- for searching
3    [
      'string: full-path-and-filename-to-1st-screenshot',
      'string: full-path-and-filename-to-2nd-screenshot',
      'string: full-path-and-filename-to-3rd-screenshot',
      'string: full-path-and-filename-to-4th-screenshot',
      'string: full-path-and-filename-to-5th-screenshot', // currently only 5, later: 1, 5, or 10.
    ],
4    'number: duration' <-- duration of film as number
5    'string: depicting size', <-- e.g. `720`, `1080`, `SD`, `HD`
6    'number: width of screenshot', <-- e.g 124 etc
  ]

*/
