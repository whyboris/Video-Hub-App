export interface FinalArray {
  inputDir: string;   // later may support array of many input directories
  outputDir: string;  // always just one -- for screenshots and JSON file
  images: Array<any>; // see below
}

/*
Each item in the images array is formatted thus:

  [
    'partial path to file',    <--- for opening the file, just prepend the `inputDir`
    'full original file name', <--- for opening the file
    'file name cleaned of dots, underscores, and file extension' <--- for searching
    [
      'full-path-and-filename-to-1st-screenshot',
      'full-path-and-filename-to-2nd-screenshot',
      'full-path-and-filename-to-3rd-screenshot',
      'full-path-and-filename-to-4th-screenshot',
      'full-path-and-filename-to-5th-screenshot', // currently only 5, later: 1, 5, or 10.
    ]
  ]

*/
