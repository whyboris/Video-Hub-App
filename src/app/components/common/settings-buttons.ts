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
    'showFoldersOnly',
    'showClips',
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
    'returnToFirstScreenshot',
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

export const SettingsMetaGroup: any = [
  [
    ...SettingsButtonsGroups[0],
    'break',
    ...SettingsButtonsGroups[1],
    'break',
    ...SettingsButtonsGroups[2],
  ],
  [
    ...SettingsButtonsGroups[3],
    'break',
    ...SettingsButtonsGroups[4],
    'break',
    ...SettingsButtonsGroups[5],
    'break',
    ...SettingsButtonsGroups[6],
    'break',
    ...SettingsButtonsGroups[7],
  ],
  [
    ...SettingsButtonsGroups[8],
  ],
];

// correspond to each group above
export const SettingsMetaGroupLabels: string[] = [
  'SETTINGS.searchAndFilter',
  'SETTINGS.galleryAndView',
  'SETTINGS.otherSettings',
  'SETTINGS.reloadUpdate' // CURRENTLY UNUSED
];

export let SettingsButtons: { [s: string]: SettingsButton } = {
  'showThumbnails': {
    hidden: false,
    toggled: true,
    iconName: 'icon-show-thumbnails',
    title: 'BUTTONS.showThumbnailsHint',
    description: 'BUTTONS.showThumbnailsDescription',
  },
  'showFilmstrip': {
    hidden: false,
    toggled: false,
    iconName: 'icon-show-filmstrip',
    title: 'BUTTONS.showFilmstripHint',
    description: 'BUTTONS.showFilmstripDescription',
  },
  'showFiles': {
    hidden: false,
    toggled: false,
    iconName: 'icon-show-filenames',
    title: 'BUTTONS.showFilesHint',
    description: 'BUTTONS.showFilesDescription',
  },
  'showFoldersOnly': {
    hidden: false,
    toggled: false,
    iconName: 'icon-folder-blank',
    title: 'BUTTONS.showFoldersOnlyHint',
    description: 'BUTTONS.showFoldersOnlyDescription',
  },
  'showClips': {
    hidden: false,
    toggled: false,
    iconName: 'icon-video-blank',
    title: 'BUTTONS.showClipsHint',
    description: 'BUTTONS.showClipsDescription',
  },
  'showTags': {
    hidden: false,
    toggled: false,
    iconName: 'icon-tag',
    title: 'BUTTONS.showTagsHint',
    description: 'BUTTONS.showTagsDescription',
  },
  'showMoreInfo': {
    hidden: false,
    toggled: true,
    iconName: 'icon-tag',
    title: 'BUTTONS.showMoreInfoHint',
    description: 'BUTTONS.showMoreInfoDescription',
  },
  'fontSizeLarger': {
    hidden: true,
    toggled: false,
    iconName: 'icon-larger',
    title: 'BUTTONS.fontSizeLargerHint',
    description: 'BUTTONS.fontSizeLargerDescription',
  },
  'hoverScrub': {
    hidden: true,
    toggled: true,
    iconName: 'icon-toggle-scrub',
    title: 'BUTTONS.hoverScrubHint',
    description: 'BUTTONS.hoverScrubDescription',
  },
  'returnToFirstScreenshot': {
    hidden: true,
    toggled: true,
    iconName: 'icon-toggle-scrub',
    title: 'BUTTONS.returnToFirstScreenshotHint',
    description: 'BUTTONS.returnToFirstScreenshotDescription',
  },
  'randomImage': {
    hidden: true,
    toggled: false,
    iconName: 'icon-random',
    title: 'BUTTONS.randomImageHint',
    description: 'BUTTONS.randomImageDescription',
  },
  'randomizeGallery': {
    hidden: true,
    toggled: false,
    iconName: 'icon-random',
    title: 'BUTTONS.randomizeGalleryHint',
    description: 'BUTTONS.randomizeGalleryDescription',
  },
  'shuffleGalleryNow': {
    hidden: false,
    toggled: false,
    iconName: 'icon-random',
    title: 'BUTTONS.shuffleGalleryNowHint',
    description: 'BUTTONS.shuffleGalleryNowDescription',
  },
  'showFolderInFileView': {
    hidden: true,
    toggled: true,
    iconName: 'icon-folder-blank',
    title: 'BUTTONS.showFolderInFileViewHint',
    description: 'BUTTONS.showFolderInFileViewDescription',
  },
  'makeSmaller': {
    hidden: false,
    toggled: false,
    iconName: 'icon-minus',
    title: 'BUTTONS.makeSmallerHint',
    description: 'BUTTONS.makeSmallerDescription',
  },
  'makeLarger': {
    hidden: false,
    toggled: false,
    iconName: 'icon-plus',
    title: 'BUTTONS.makeLargerHint',
    description: 'BUTTONS.makeLargerDescription',
  },
  'darkMode': {
    hidden: false,
    toggled: false,
    iconName: 'icon-darken',
    title: 'BUTTONS.darkModeHint',
    description: 'BUTTONS.darkModeDescription',
  },
  'folderUnion': {
    hidden: true,
    toggled: false,
    iconName: 'icon-folder-plus',
    title: 'BUTTONS.folderUnionHint',
    description: 'BUTTONS.folderUnionDescription',
  },
  'folder': {
    hidden: false,
    toggled: true,
    iconName: 'icon-folder-minus',
    title: 'BUTTONS.folderHint',
    description: 'BUTTONS.folderDescription',
  },
  'fileUnion': {
    hidden: true,
    toggled: false,
    iconName: 'icon-video-plus',
    title: 'BUTTONS.fileUnionHint',
    description: 'BUTTONS.fileUnionDescription',
  },
  'file': {
    hidden: false,
    toggled: true,
    iconName: 'icon-video-minus',
    title: 'BUTTONS.fileHint',
    description: 'BUTTONS.fileDescription',
  },
  'exclude': {
    hidden: true,
    toggled: false,
    iconName: 'icon-video-x',
    title: 'BUTTONS.excludeHint',
    description: 'BUTTONS.excludeDescription',
  },
  'magic': {
    hidden: false,
    toggled: true,
    iconName: 'icon-looking-glass',
    title: 'BUTTONS.magicHint',
    description: 'BUTTONS.magicDescription',
  },
  'resolutionFilter': {
    hidden: false,
    toggled: true,
    iconName: 'icon-res-filter',
    title: 'BUTTONS.resolutionFilterHint',
    description: 'BUTTONS.resolutionFilterDescription',
  },
  'showFreq': {
    hidden: false,
    toggled: true,
    iconName: 'icon-cloud',
    title: 'BUTTONS.showFreqHint',
    description: 'BUTTONS.showFreqDescription',
  },
  'showRecent': {
    hidden: false,
    toggled: true,
    iconName: 'icon-show-filenames',
    title: 'BUTTONS.showRecentHint',
    description: 'BUTTONS.showRecentDescription',
  },
  'hideSidebar': {
    hidden: false,
    toggled: false,
    iconName: 'icon-chevron-left',
    title: 'BUTTONS.hideSidebarHint',
    description: 'BUTTONS.hideSidebarDescription',
  },
  'hideTop': {
    hidden: false,
    toggled: false,
    iconName: 'icon-chevron-up',
    title: 'BUTTONS.hideTopHint',
    description: 'BUTTONS.hideTopDescription',
  },
  'flatIcons': {
    hidden: false,
    toggled: false,
    iconName: 'icon-checkmark', // this specific icon makes the setting only appear in All Settings (behind gear button)
    title: 'BUTTONS.flatIconsHint',
    description: 'BUTTONS.flatIconsDescription',
  },
  'startWizard': {
    hidden: false,
    toggled: false,
    iconName: 'icon-checkmark', // this specific icon makes the setting only appear in All Settings (behind gear button)
    title: 'BUTTONS.startWizardHint',
    description: 'BUTTONS.startWizardDescription',
  },
  'clearHistory': {
    hidden: false,
    toggled: false,
    iconName: 'icon-checkmark', // this specific icon makes the setting only appear in All Settings (behind gear button)
    title: 'BUTTONS.clearHistoryHint',
    description: 'BUTTONS.clearHistoryDescription',
  },
  'resetSettings': {
    hidden: false,
    toggled: false,
    iconName: 'icon-checkmark', // this specific icon makes the setting only appear in All Settings (behind gear button)
    title: 'BUTTONS.resetSettingsHint',
    description: 'BUTTONS.resetSettingsDescription',
  },
  'rescanDirectory': {
    hidden: false,
    toggled: false,
    iconName: 'icon-checkmark', // this specific icon makes the setting only appear in All Settings (behind gear button)
    title: 'BUTTONS.rescanDirectoryHint',
    description: 'BUTTONS.rescanDirectoryDescription',
  }
};
