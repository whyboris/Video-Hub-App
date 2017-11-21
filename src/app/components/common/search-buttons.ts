export let SearchButtons = [
  {
    uniqueKey: 'folderUnion',
    hidden: true,
    toggled: false,
    iconName: 'icon-folder',
    title: 'Folder union search',
    description: 'Search in all folders containing any of the search words'
  }, {
    uniqueKey: 'folder',
    hidden: false,
    toggled: false,
    iconName: 'icon-folder',
    title: 'Folder search',
    description: 'Search in folders containing each of the search words'
  }, {
    uniqueKey: 'fileUnion',
    hidden: true,
    toggled: false,
    iconName: 'icon-video',
    title: 'Video union search',
    description: 'Search for videos containing any of the search words'
  }, {
    uniqueKey: 'file',
    hidden: false,
    toggled: true,
    iconName: 'icon-video',
    title: 'Video search',
    description: 'Search for videos containing each of the search words'
  }, {
    uniqueKey: 'exclude',
    hidden: false,
    toggled: true,
    iconName: 'icon-thumbs-down',
    title: 'Exclude filter',
    description: 'Exclude any files that contain this string'
  }, {
    uniqueKey: 'magic',
    hidden: false,
    toggled: true,
    iconName: 'icon-search',
    title: 'Magic search',
    description: 'Live search showing all files and files inside folders that contain search words'
  }, {
    uniqueKey: 'showFreq',
    hidden: false,
    toggled: true,
    iconName: 'icon-cloud',
    title: 'Word cloud',
    description: 'Show the nine most frequent words in current file names'
  }, {
    uniqueKey: 'hideSidebar',
    hidden: false,
    toggled: false,
    iconName: 'icon-left-circled',
    title: 'Hide sidebar',
    description: 'Hides the search filter sidebar'
  }
]
