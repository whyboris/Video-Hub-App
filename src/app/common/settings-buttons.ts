import { SettingsButton } from './settings-buttons.interface';

// Add `SettingsButtons` items here so they show up in the buttons ribbon and in the settings
// Each array separates buttons into their own button groups visually
export const SettingsButtonsGroups: string[][] = [
  [
    'hideSidebar',
  ],
  [
    'folderUnion',
    'folderIntersection',
    'fileUnion',
    'fileIntersection',
    'exclude',
    'tagUnion',
    'tagIntersection',
    'tagExclusion',
    'magic',
    'fuzzy',
  ],
  [
    'durationFilter',
    'resolutionFilter',
    'starFilter',
    'sortOrder',
    'sortOptionAlphabetical',
    'sortOptionTime',
    'sortOptionSize',
    'sortOptionTimesPlayed',
    'sortOptionStar',
    'sortOptionYear',
    'sortOptionModified',
  ],
  [
    'duplicateLength',
    'duplicateSize',
    'duplicateHash',
    'showFreq',
    'extendedWordCloud',
    'showRecent'
  ],
  [
    'showThumbnails',
    'showFilmstrip',
    'showFullView',
    'showDetails',
    'showFiles',
    'showClips',
  ],
  [
    'compactView',
    'showMoreInfo',
    'fontSizeLarger',
  ],
  [
    'showFolders',
    'showFaces',
    'showRelatedVideosTray',
    'shuffleGalleryNow',
  ],
  [
    'showTags',
    'autoFileTags',
    'autoFolderTags',
  ],
  [
    'manualTags',
    'showTagTray',
    'tagFrequencySort'
  ],
  [
    'hoverScrub',
    'thumbAutoAdvance',
    'returnToFirstScreenshot',
  ],
  [
    'muteClips',
    'autoplayClips',
  ],
  [
    'makeSmaller',
    'makeLarger',
  ],
  [
    'darkMode',
  ],
  [
    'hideTop',
    'flatIcons'
  ],
  [
    'startWizard',
    'rescanDirectory',
    'importNewFiles',
    'verifyThumbnails',
    // 'regenerateLibrary', // TODO - maybe enable someday?
    'resetSettings',
    'clearHistory',
    'showDeleteOption',
    'openAtTimestamp'
  ]
];

export const SettingsMetaGroup: any = [
  [
    ...SettingsButtonsGroups[0],
    'break',
    ...SettingsButtonsGroups[1],
    'break',
    ...SettingsButtonsGroups[2],
    'break',
    ...SettingsButtonsGroups[3],
  ],
  [
    ...SettingsButtonsGroups[4],
    'break',
    ...SettingsButtonsGroups[5],
    'break',
    ...SettingsButtonsGroups[6],
    'break',
    ...SettingsButtonsGroups[7],
    'break',
    ...SettingsButtonsGroups[8],
    'break',
    ...SettingsButtonsGroups[9],
    'break',
    ...SettingsButtonsGroups[10],
    'break',
    ...SettingsButtonsGroups[11],
    'break',
    ...SettingsButtonsGroups[12],
    'break',
    ...SettingsButtonsGroups[13],
  ],
  [
    ...SettingsButtonsGroups[14],
  ],
];

// correspond to each group above
export const SettingsMetaGroupLabels: string[] = [
  'SETTINGS.searchAndFilter',
  'SETTINGS.galleryAndView',
  'SETTINGS.otherSettings',
];

export let SettingsButtons: { [s: string]: SettingsButton } = {
  'autoFileTags': {
    description: 'BUTTONS.autoFileTagsDescription',
    hidden: true,
    iconName: 'icon-tag-auto-file',
    moreInfo: 'BUTTONS.autoFileTagsMoreInfo',
    title: 'BUTTONS.autoFileTagsHint',
    toggled: true
  },
  'autoFolderTags': {
    description: 'BUTTONS.autoFolderTagsDescription',
    hidden: true,
    iconName: 'icon-tag-auto-folder',
    moreInfo: 'BUTTONS.autoFolderTagsMoreInfo',
    title: 'BUTTONS.autoFolderTagsHint',
    toggled: false
  },
  'autoplayClips': {
    description: 'BUTTONS.autoplayClipsDescription',
    hidden: true,
    iconName: 'icon-auto-play-clips',
    title: 'BUTTONS.autoplayClipsHint',
    toggled: false
  },
  'clearHistory': {
    description: 'BUTTONS.clearHistoryDescription',
    hidden: false,
    iconName: 'icon-checkmark', // this specific icon makes the button only appear in the Settings menu (not in ribbon)
    title: 'BUTTONS.clearHistoryHint',
    toggled: false
  },
  'showDeleteOption': {
    description: 'BUTTONS.showDeleteButtonDescription',
    hidden: true,
    iconName: 'icon-checkmark', // this specific icon makes the button only appear in the Settings menu (not in ribbon)
    moreInfo: 'BUTTONS.showDeleteButtonMoreInfo',
    title: 'BUTTONS.showDeleteButton',
    toggled: false
  },
  'darkMode': {
    description: 'BUTTONS.darkModeDescription',
    hidden: false,
    iconName: 'icon-darken',
    settingsHeading: 'SETTINGS.darkMode',
    title: 'BUTTONS.darkModeHint',
    toggled: false
  },
  'duplicateLength': {
    description: 'BUTTONS.duplicateLengthDescription',
    hidden: true,
    iconName: 'icon-checkmark', // this specific icon makes the button only appear in the Settings menu (not in ribbon)
    moreInfo: 'BUTTONS.duplicateLengthMoreInfo',
    settingsHeading: 'SETTINGS.duplicateLength',
    title: 'BUTTONS.duplicateLengthHint',
    toggled: false
  },
  'duplicateSize': {
    description: 'BUTTONS.duplicateSizeDescription',
    hidden: true,
    iconName: 'icon-checkmark', // this specific icon makes the button only appear in the Settings menu (not in ribbon)
    moreInfo: 'BUTTONS.duplicateSizeMoreInfo',
    title: 'BUTTONS.duplicateSizeHint',
    toggled: false
  },
  'duplicateHash': {
    description: 'BUTTONS.duplicateHashDescription',
    hidden: true,
    iconName: 'icon-checkmark', // this specific icon makes the button only appear in the Settings menu (not in ribbon)
    title: 'BUTTONS.duplicateHashHint',
    moreInfo: 'BUTTONS.duplicateHashMoreInfo',
    toggled: false
  },
  'durationFilter': {
    description: 'BUTTONS.durationFilterDescription',
    hidden: false,
    iconName: 'icon-hourglass',
    moreInfo: 'BUTTONS.durationFilterMoreInfo',
    settingsHeading: 'SETTINGS.sortingFilters',
    title: 'BUTTONS.durationFilterHint',
    toggled: false
  },
  'exclude': {
    description: 'BUTTONS.excludeDescription',
    moreInfo: 'BUTTONS.excludeMoreInfo',
    hidden: true,
    iconName: 'icon-video-x',
    title: 'BUTTONS.excludeHint',
    toggled: false
  },
  'extendedWordCloud': {
    description: 'BUTTONS.extendedWordCloudDescription',
    moreInfo: 'BUTTONS.extendedWordCloudMoreInfo',
    hidden: true,
    iconName: 'icon-cloud-plus',
    title: 'BUTTONS.extendedWordCloudHint',
    toggled: false
  },
  'fileIntersection': {
    description: 'BUTTONS.fileDescription',
    moreInfo: 'BUTTONS.fileMoreInfo',
    hidden: false,
    iconName: 'icon-video-minus',
    title: 'BUTTONS.fileHint',
    toggled: true
  },
  'fileUnion': {
    description: 'BUTTONS.fileUnionDescription',
    moreInfo: 'BUTTONS.fileUnionMoreInfo',
    hidden: true,
    iconName: 'icon-video-plus',
    title: 'BUTTONS.fileUnionHint',
    toggled: false
  },
  'flatIcons': {
    description: 'BUTTONS.flatIconsDescription',
    hidden: false,
    iconName: 'icon-checkmark', // this specific icon makes the button only appear in the Settings menu (not in ribbon)
    settingsHeading: 'SETTINGS.buttonStyle',
    title: 'BUTTONS.flatIconsHint',
    toggled: false
  },
  'folderIntersection': {
    description: 'BUTTONS.folderDescription',
    moreInfo: 'BUTTONS.folderMoreInfo',
    hidden: false,
    iconName: 'icon-folder-minus',
    title: 'BUTTONS.folderHint',
    toggled: true
  },
  'folderUnion': {
    description: 'BUTTONS.folderUnionDescription',
    moreInfo: 'BUTTONS.folderUnionMoreInfo',
    hidden: true,
    iconName: 'icon-folder-plus',
    settingsHeading: 'SETTINGS.searchFilters',
    title: 'BUTTONS.folderUnionHint',
    toggled: false
  },
  'fontSizeLarger': {
    description: 'BUTTONS.fontSizeLargerDescription',
    hidden: true,
    iconName: 'icon-larger-font',
    title: 'BUTTONS.fontSizeLargerHint',
    toggled: false
  },
  'hideSidebar': {
    description: 'BUTTONS.hideSidebarDescription',
    hidden: false,
    iconName: 'icon-chevron-left',
    title: 'BUTTONS.hideSidebarHint',
    toggled: false
  },
  'hideTop': {
    description: 'BUTTONS.hideTopDescription',
    hidden: false,
    iconName: 'icon-chevron-up',
    settingsHeading: 'SETTINGS.hideTopBar',
    title: 'BUTTONS.hideTopHint',
    toggled: false
  },
  'hoverScrub': {
    description: 'BUTTONS.hoverScrubDescription',
    moreInfo: 'BUTTONS.hoverScrubMoreInfo',
    hidden: true,
    iconName: 'icon-toggle-scrub',
    settingsHeading: 'SETTINGS.thumbnailHeading',
    title: 'BUTTONS.hoverScrubHint',
    toggled: true
  },
  'thumbAutoAdvance': {
    description: 'BUTTONS.thumbAutoAdvanceDescription',
    moreInfo: 'BUTTONS.thumbAutoAdvanceMoreInfo',
    hidden: true,
    iconName: 'icon-toggle-auto-scrub',
    title: 'BUTTONS.thumbAutoAdvanceHint',
    toggled: false
  },
  'importNewFiles': {
    description: 'BUTTONS.importNewFilesDescription',
    hidden: true,
    iconName: 'icon-import-new',
    moreInfo: 'BUTTONS.importNewFilesMoreInfo',
    title: 'BUTTONS.importNewFilesHint',
    toggled: false
  },
  'magic': {
    description: 'BUTTONS.magicDescription',
    hidden: false,
    iconName: 'icon-looking-glass',
    moreInfo: 'BUTTONS.magicMoreInfo',
    title: 'BUTTONS.magicHint',
    toggled: true
  },
  'fuzzy': {
    description: 'BUTTONS.fuzzyDescription',
    hidden: false,
    iconName: 'icon-show-similar',
    moreInfo: 'BUTTONS.fuzzyMoreInfo',
    title: 'BUTTONS.fuzzyHint',
    toggled: true
  },
  'makeLarger': {
    description: 'BUTTONS.makeLargerDescription',
    hidden: false,
    iconName: 'icon-plus',
    title: 'BUTTONS.makeLargerHint',
    toggled: false
  },
  'makeSmaller': {
    description: 'BUTTONS.makeSmallerDescription',
    hidden: false,
    iconName: 'icon-minus',
    settingsHeading: 'SETTINGS.zoom',
    title: 'BUTTONS.makeSmallerHint',
    toggled: false
  },
  'manualTags': {
    description: 'BUTTONS.manualTagsDescription',
    hidden: true,
    iconName: 'icon-tag-manual',
    moreInfo: 'BUTTONS.manualTagsMoreInfo',
    settingsHeading: 'SETTINGS.manualTags',
    title: 'BUTTONS.manualTagsHint',
    toggled: true
  },
  'muteClips': {
    description: 'BUTTONS.muteClipsDescription',
    hidden: true,
    iconName: 'icon-mute-clips',
    settingsHeading: 'SETTINGS.clipsHeading',
    title: 'BUTTONS.muteClipsHint',
    toggled: true
  },
  'openAtTimestamp': {
    description: 'BUTTONS.openAtTimestampDescription',
    hidden: true,
    iconName: 'icon-toggle-scrub',
    moreInfo: 'BUTTONS.openAtTimestampMoreInfo',
    title: 'BUTTONS.openAtTimestampHint',
    toggled: false
  },
  'regenerateLibrary': {
    description: 'BUTTONS.regenerateLibraryDescription',
    hidden: false,
    iconName: 'icon-checkmark', // this specific icon makes the button only appear in the Settings menu (not in ribbon)
    title: 'BUTTONS.regenerateLibraryHint',
    toggled: false
  },
  'rescanDirectory': {
    description: 'BUTTONS.rescanDirectoryDescription',
    hidden: true,
    iconName: 'icon-import-rescan',
    moreInfo: 'BUTTONS.rescanDirectoryMoreInfo',
    settingsHeading: 'SETTINGS.currentHub',
    title: 'BUTTONS.rescanDirectoryHint',
    toggled: false
  },
  'resetSettings': {
    description: 'BUTTONS.resetSettingsDescription',
    hidden: false,
    iconName: 'icon-checkmark', // this specific icon makes the button only appear in the Settings menu (not in ribbon)
    settingsHeading: 'SETTINGS.variousSettings',
    title: 'BUTTONS.resetSettingsHint',
    toggled: false
  },
  'resolutionFilter': {
    description: 'BUTTONS.resolutionFilterDescription',
    hidden: false,
    iconName: 'icon-res-filter',
    moreInfo: 'BUTTONS.resolutionFilterMoreInfo',
    title: 'BUTTONS.resolutionFilterHint',
    toggled: false
  },
  'returnToFirstScreenshot': {
    description: 'BUTTONS.returnToFirstScreenshotDescription',
    moreInfo: 'BUTTONS.returnToFirstScreenshotMoreInfo',
    hidden: true,
    iconName: 'icon-toggle-scrub-return',
    title: 'BUTTONS.returnToFirstScreenshotHint',
    toggled: true
  },
  'showClips': {
    description: 'BUTTONS.showClipsDescription',
    hidden: false,
    iconName: 'icon-video-blank',
    title: 'BUTTONS.showClipsHint',
    toggled: false
  },
  'showDetails': {
    description: 'BUTTONS.showDetailsDescription',
    hidden: false,
    iconName: 'icon-show-details',
    title: 'BUTTONS.showDetailsHint',
    toggled: false
  },
  'showFiles': {
    description: 'BUTTONS.showFilesDescription',
    hidden: false,
    iconName: 'icon-show-filenames',
    title: 'BUTTONS.showFilesHint',
    toggled: false
  },
  'showFilmstrip': {
    description: 'BUTTONS.showFilmstripDescription',
    hidden: false,
    iconName: 'icon-show-filmstrip',
    title: 'BUTTONS.showFilmstripHint',
    toggled: false
  },
  'showFolders': {
    description: 'BUTTONS.showFoldersDescription',
    moreInfo: 'BUTTONS.showFoldersMoreInfo',
    hidden: false,
    settingsHeading: 'SETTINGS.viewSettings',
    iconName: 'icon-folder-blank',
    title: 'BUTTONS.showFoldersHint',
    toggled: false
  },
  'showFaces': {
    description: 'BUTTONS.showFacesDescription',
    moreInfo: 'BUTTONS.showFacesMoreInfo',
    hidden: false,
    iconName: 'icon-star',
    title: 'BUTTONS.showFacesHint',
    toggled: false
  },
  'showFreq': {
    description: 'BUTTONS.showFreqDescription',
    moreInfo: 'BUTTONS.showFreqMoreInfo',
    hidden: false,
    iconName: 'icon-cloud',
    settingsHeading: 'SETTINGS.wordCloud',
    title: 'BUTTONS.showFreqHint',
    toggled: false
  },
  'showFullView': {
    description: 'BUTTONS.showFullViewDescription',
    hidden: false,
    iconName: 'icon-show-full-view',
    title: 'BUTTONS.showFullViewHint',
    toggled: false
  },
  'showMoreInfo': {
    description: 'BUTTONS.showMoreInfoDescription',
    hidden: false,
    iconName: 'icon-show-more-info',
    title: 'BUTTONS.showMoreInfoHint',
    toggled: true
  },
  'compactView': {
    description: 'BUTTONS.compactViewDescription',
    settingsHeading: 'SETTINGS.miscView',
    hidden: false,
    iconName: 'icon-compact-view',
    moreInfo: 'BUTTONS.compactViewMoreInfo',
    title: 'BUTTONS.compactViewHint',
    toggled: false
  },
  'showRecent': {
    description: 'BUTTONS.showRecentDescription',
    hidden: false,
    iconName: 'icon-recent-history',
    title: 'BUTTONS.showRecentHint',
    toggled: false
  },
  'showRelatedVideosTray': {
    description: 'BUTTONS.relatedTrayDescription',
    moreInfo: 'BUTTONS.relatedTrayMoreInfo',
    hidden: false,
    iconName: 'icon-show-similar',
    title: 'BUTTONS.relatedTrayHint',
    toggled: false
  },
  'showTags': {
    description: 'BUTTONS.showTagsDescription',
    hidden: false,
    iconName: 'icon-tag-auto',
    moreInfo: 'BUTTONS.showTagsMoreInfo',
    settingsHeading: 'SETTINGS.autoGenerated',
    title: 'BUTTONS.showTagsHint',
    toggled: false
  },
  'showTagTray': {
    description: 'BUTTONS.tagTrayDescription',
    hidden: true,
    iconName: 'icon-tag-tray',
    title: 'BUTTONS.tagTrayHint',
    toggled: false
  },
  'showThumbnails': {
    description: 'BUTTONS.showThumbnailsDescription',
    hidden: false,
    iconName: 'icon-show-thumbnails',
    title: 'BUTTONS.showThumbnailsHint',
    toggled: true
  },
  'shuffleGalleryNow': {
    description: 'BUTTONS.shuffleGalleryNowDescription',
    hidden: false,
    iconName: 'icon-random',
    title: 'BUTTONS.shuffleGalleryNowHint',
    toggled: false
  },
  'sortOptionAlphabetical': {
    description: 'BUTTONS.sortOptionAlphabeticalDescription',
    hidden: false,
    iconName: 'icon-checkmark', // this specific icon makes the button only appear in the Settings menu (not in ribbon)
    moreInfo: 'BUTTONS.sortOptionAlphabeticalMoreInfo',
    settingsHeading: 'BUTTONS.sortOptionsHeading',
    title: '',
    toggled: false
  },
  'sortOptionModified': {
    description: 'BUTTONS.sortOptionModifiedDescription',
    hidden: false,
    iconName: 'icon-checkmark', // this specific icon makes the button only appear in the Settings menu (not in ribbon)
    moreInfo: 'BUTTONS.sortOptionModifiedMoreInfo',
    title: '',
    toggled: false,
  },
  'sortOptionSize': {
    description: 'BUTTONS.sortOptionSizeDescription',
    hidden: false,
    iconName: 'icon-checkmark', // this specific icon makes the button only appear in the Settings menu (not in ribbon)
    moreInfo: 'BUTTONS.sortOptionSizeMoreInfo',
    title: '',
    toggled: true,
  },
  'sortOptionStar': {
    description: 'BUTTONS.sortOptionStarDescription',
    hidden: false,
    iconName: 'icon-checkmark', // this specific icon makes the button only appear in the Settings menu (not in ribbon)
    moreInfo: 'BUTTONS.sortOptionStarMoreInfo',
    title: '',
    toggled: false,
  },
  'sortOptionTime': {
    description: 'BUTTONS.sortOptionTimeDescription',
    hidden: false,
    iconName: 'icon-checkmark', // this specific icon makes the button only appear in the Settings menu (not in ribbon)
    moreInfo: 'BUTTONS.sortOptionTimeMoreInfo',
    title: '',
    toggled: true,
  },
  'sortOptionTimesPlayed': {
    description: 'BUTTONS.sortOptionTimesPlayedDescription',
    hidden: false,
    iconName: 'icon-checkmark', // this specific icon makes the button only appear in the Settings menu (not in ribbon)
    moreInfo: 'BUTTONS.sortOptionTimesPlayedMoreInfo',
    title: '',
    toggled: false,
  },
  'sortOptionYear': {
    description: 'BUTTONS.sortOptionYearDescription',
    hidden: false,
    iconName: 'icon-checkmark', // this specific icon makes the button only appear in the Settings menu (not in ribbon)
    moreInfo: 'BUTTONS.sortOptionYearMoreInfo',
    title: '',
    toggled: false
  },
  'sortOrder': {
    description: 'BUTTONS.sortOrderDescription',
    hidden: false,
    iconName: 'icon-sort-order',
    moreInfo: 'BUTTONS.sortOrderMoreInfo',
    title: 'BUTTONS.sortOrderHint',
    toggled: false
  },
  'starFilter': {
    description: 'BUTTONS.starFilterDescription',
    hidden: false,
    iconName: 'icon-star',
    moreInfo: 'BUTTONS.starFilterMoreInfo',
    title: 'BUTTONS.starFilterHint',
    toggled: false
  },
  'startWizard': {
    description: 'BUTTONS.startWizardDescription',
    hidden: false,
    iconName: 'icon-checkmark', // this specific icon makes the button only appear in the Settings menu (not in ribbon)
    title: 'BUTTONS.startWizardHint',
    toggled: false
  },
  'tagExclusion': {
    description: 'BUTTONS.tagExclusionDescription',
    moreInfo: 'BUTTONS.tagExclusionMoreInfo',
    hidden: true,
    iconName: 'icon-tag-x',
    title: 'BUTTONS.tagExclusionHint',
    toggled: false
  },
  'tagFrequencySort': {
    description: 'BUTTONS.tagFrequencySortDescription',
    hidden: true,
    iconName: 'icon-tag-frequency',
    title: 'BUTTONS.tagFrequencySortHint',
    toggled: false
  },
  'tagIntersection': {
    description: 'BUTTONS.tagIntersectionDescription',
    moreInfo: 'BUTTONS.tagIntersectionMoreInfo',
    hidden: true,
    iconName: 'icon-tag-minus',
    title: 'BUTTONS.tagIntersectionHint',
    toggled: false
  },
  'tagUnion': {
    description: 'BUTTONS.tagUnionDescription',
    moreInfo: 'BUTTONS.tagUnionMoreInfo',
    hidden: true,
    iconName: 'icon-tag-plus',
    title: 'BUTTONS.tagUnionHint',
    toggled: false
  },
  'verifyThumbnails': {
    description: 'BUTTONS.verifyThumbnailsDescription',
    hidden: false,
    iconName: 'icon-checkmark', // this specific icon makes the button only appear in the Settings menu (not in ribbon)
    moreInfo: 'BUTTONS.verifyThumbnailsMoreInfo',
    title: 'BUTTONS.verifyThumbnailsHint',
    toggled: false
  }
};
