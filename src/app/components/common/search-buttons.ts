export const SearchButtonsOrder = [
  'hideSidebar',
  'folderUnion',
  'folder',
  'fileUnion',
  'file',
  'exclude',
  'magic',
  'showFreq'
];

export let SearchButtons = {
  'folderUnion': {
    hidden: true,
    toggled: false,
    iconName: 'icon-folder',
    title: 'Folder union search',
    description: 'Search in all folders containing any of the search words'
  },
  'folder': {
    hidden: false,
    toggled: false,
    iconName: 'icon-folder',
    title: 'Folder search',
    description: 'Search in folders containing each of the search words'
  },
  'fileUnion': {
    hidden: true,
    toggled: false,
    iconName: 'icon-video',
    title: 'Video union search',
    description: 'Search for videos containing any of the search words'
  },
  'file': {
    hidden: false,
    toggled: true,
    iconName: 'icon-video',
    title: 'Video search',
    description: 'Search for videos containing each of the search words'
  },
  'exclude': {
    hidden: false,
    toggled: true,
    iconName: 'icon-thumbs-down',
    title: 'Exclude filter',
    description: 'Exclude any files that contain this string'
  },
  'magic': {
    hidden: false,
    toggled: true,
    iconName: 'icon-search',
    title: 'Magic search',
    description: 'Live search showing all files and files inside folders that contain search words'
  },
  'showFreq': {
    hidden: false,
    toggled: true,
    iconName: 'icon-cloud',
    title: 'Word cloud',
    description: 'Show the nine most frequent words in current file names'
  },
  'hideSidebar': {
    hidden: false,
    toggled: false,
    iconName: 'icon-left-circled',
    title: 'Hide sidebar',
    description: 'Hides the search filter sidebar'
  }
}
