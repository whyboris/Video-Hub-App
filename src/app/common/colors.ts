export enum Colors {
  autoFileTags =       '#a8bffb',
  autoFolderTags =     '#fec02f',
  manualTags =         '#f5f5f5', // same as `manual-tag-color` (see variables.scss)
  // don't alphabetize below
  // this is the order in which filters appear
  folderUnion =        '#FFD672',
  folderIntersection = '#ffe5a5',
  folderExclusion =    '#FF8888', // same as exclusion and tagExclusion
  fileUnion =          '#97b3fc', // like `fileIntersection` but darker
  fileIntersection =   '#b1c6fd',
  exclude =            '#FF8888',
  tagUnion =           '#f0f0f0', // like `tagIntersection` but darker
  tagIntersection =    '#f5f5f5', // same as `manual-tag-color` (see variables.scss)
  tagExclusion =       '#FF8888',
  videoNotes =         '#b1c6fd', // TODO -- pick a better color?
}
