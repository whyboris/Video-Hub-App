import { SettingsButton } from './settings-buttons.interface';

export const SettingsButtonsGroups: string[][] = [
  [
    'hideSidebar',
  ],
  [
    'folderUnion',
    'folder',
    'fileUnion',
    'file',
    'exclude',
    'magic',
    'resolutionFilter',
  ],
  [
    'showFreq',
    'showTags',
    'showRecent'
  ],
  [
    'showThumbnails',
    'showFilmstrip',
    'showFiles',
  ],
  [
    'makeSmaller',
    'makeLarger',
  ],
  [
    'darkMode',
  ],
  [
    'showMoreInfo',
    'fontSizeLarger',
    'hoverScrub',
    'randomImage',
    'randomizeGallery',
    'shuffleGalleryNow',
    'showFolderInFileView'
  ],
  [
    'hideTop',
    'flatIcons'
  ],
  [
    'resetSettings',
    'clearHistory',
    'rescanDirectory',
    'startWizard'
  ]
];

// correspond to each group above
export const SettingsCategories: string[] = [
  'Search & filter settings',
  '',
  '',
  'Gallery & view settings',
  '',
  '',
  '',
  'Other settings',
  'Reload / update hub'
]

export let SettingsButtons: { [s: string]: SettingsButton } = {
  'showThumbnails': {
    hidden: false,
    toggled: true,
    iconName: 'icon-show-thumbnails',
    title: 'Show thumbnails',
    description: 'Switches to the thumbnails view',
  },
  'showFilmstrip': {
    hidden: false,
    toggled: false,
    iconName: 'icon-show-filmstrip',
    title: 'Show filmstrip',
    description: 'Switches to the filmstrip view'
  },
  'showFiles': {
    hidden: false,
    toggled: false,
    iconName: 'icon-show-filenames',
    title: 'Show files',
    description: 'Switches to the files view',
  },
  'showTags': {
    hidden: false,
    toggled: false,
    iconName: 'icon-tag',
    title: 'Show tags',
    description: 'Toggles showing auto-generated tags'
  },
  'showMoreInfo': {
    hidden: false,
    toggled: true,
    iconName: 'icon-tag',
    title: 'Show more info',
    description: 'Toggles showing file name, resolution, and video length'
  },
  'fontSizeLarger': {
    hidden: true,
    toggled: false,
    iconName: 'icon-larger',
    title: 'Toggle font size',
    description: 'Toggles the font between larger and smaller'
  },
  'hoverScrub': {
    hidden: true,
    toggled: true,
    iconName: 'icon-toggle-scrub',
    title: 'Toggle hover animations',
    description: 'Toggles whether hovering the mouse over thumbnails or filmstrip shows video preview screenshots'
  },
  'randomImage': {
    hidden: true,
    toggled: false,
    iconName: 'icon-random',
    title: 'Show random screenshot',
    description: 'Toggles whether a random screenshot from each video is shown every time you search or scroll'
  },
  'randomizeGallery': {
    hidden: true,
    toggled: false,
    iconName: 'icon-random',
    title: 'Randomize gallery order',
    description: 'Randomizes the order of video files after every search'
  },
  'shuffleGalleryNow': {
    hidden: false,
    toggled: false,
    iconName: 'icon-random',
    title: 'Shuffle current results',
    description: 'Shuffles the results in current view'
  },
  'showFolderInFileView': {
    hidden: true,
    toggled: true,
    iconName: 'icon-folder-blank',
    title: 'Show folders in file view',
    description: 'Shows folder locations in the file view'
  },
  'makeSmaller': {
    hidden: false,
    toggled: false,
    iconName: 'icon-minus',
    title: 'Decrease preview size',
    description: 'Decreases thumbnail and filmstrip preview sizes'
  },
  'makeLarger': {
    hidden: false,
    toggled: false,
    iconName: 'icon-plus',
    title: 'Increase preview size',
    description: 'Increases thumbnail and filmstrip preview sizes'
  },
  'darkMode': {
    hidden: false,
    toggled: false,
    iconName: 'icon-darken',
    title: 'Dark mode',
    description: 'Toggles between dark and light mode'
  },
  'folderUnion': {
    hidden: true,
    toggled: false,
    iconName: 'icon-folder-plus',
    title: 'Folder union search',
    description: 'Toggles the search for all folders containing any of the search words'
  },
  'folder': {
    hidden: false,
    toggled: true,
    iconName: 'icon-folder-minus',
    title: 'Folder search',
    description: 'Toggles the search for folders containing each of the search words'
  },
  'fileUnion': {
    hidden: true,
    toggled: false,
    iconName: 'icon-video-plus',
    title: 'Video union search',
    description: 'Toggles the search for videos containing any of the search words'
  },
  'file': {
    hidden: false,
    toggled: true,
    iconName: 'icon-video-minus',
    title: 'Video search',
    description: 'Toggles the search for videos containing each of the search words'
  },
  'exclude': {
    hidden: true,
    toggled: false,
    iconName: 'icon-video-x',
    title: 'Exclude filter',
    description: 'Toggles the search filter to exclude any files that contain the filter word'
  },
  'magic': {
    hidden: false,
    toggled: true,
    iconName: 'icon-looking-glass',
    title: 'Magic search',
    description: 'Toggle the magic search which updates the results as you type. ' +
      'Magic search displays all files that contain the search term ' +
      'and every file inside any folder that contains the search term in its name'
  },
  'resolutionFilter': {
    hidden: false,
    toggled: true,
    iconName: 'icon-res-filter',
    title: 'Resolution filter',
    description: 'Toggles the resolution filter'
  },
  'showFreq': {
    hidden: false,
    toggled: true,
    iconName: 'icon-cloud',
    title: 'Word cloud',
    description: 'Toggles the word cloud which shows up to nine of the most frequent words in currently shown files'
  },
  'showRecent': {
    hidden: false,
    toggled: true,
    iconName: 'icon-show-filenames',
    title: 'Show recently opened hubs',
    description: 'Toggles the recently-opened video hub history'
  },
  'hideSidebar': {
    hidden: false,
    toggled: false,
    iconName: 'icon-chevron-left',
    title: 'Hide sidebar',
    description: 'Hides the search filter sidebar'
  },
  'hideTop': {
    hidden: false,
    toggled: false,
    iconName: 'icon-chevron-up',
    title: 'Hide top',
    description: 'Hides the top bar'
  },
  'flatIcons': {
    hidden: false,
    toggled: false,
    iconName: 'icon-checkmark', // this specific icon makes the setting only appear in All Settings (behind gear button)
    title: 'Flat icons',
    description: 'Toggles between flat and traditional button styles'
  },
  'startWizard': {
    hidden: false,
    toggled: false,
    iconName: 'icon-checkmark', // this specific icon makes the setting only appear in All Settings (behind gear button)
    title: 'Start wizard',
    description: 'Starts wizard again: create a new video hub or open recent'
  },
  'clearHistory': {
    hidden: false,
    toggled: false,
    iconName: 'icon-checkmark', // this specific icon makes the setting only appear in All Settings (behind gear button)
    title: 'Clear history',
    description: 'Clears the recently-opened history'
  },
  'resetSettings': {
    hidden: false,
    toggled: false,
    iconName: 'icon-checkmark', // this specific icon makes the setting only appear in All Settings (behind gear button)
    title: 'Reset settings',
    description: 'Resets settings and buttons to their default values'
  },
  'rescanDirectory': {
    hidden: false,
    toggled: false,
    iconName: 'icon-checkmark', // this specific icon makes the setting only appear in All Settings (behind gear button)
    title: 'Rescan directory',
    description: 'Rescans the video folder for any file changes ' +
      '(addition, renaming, deletion of videos) ' +
      'and updates the current hub'
  }
}
