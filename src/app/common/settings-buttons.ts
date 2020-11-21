import { SettingsButton } from './settings-buttons.interface';

export type SettingsButtonKey = 'autoFileTags'
 | 'autoFolderTags'
 | 'autoplayClips'
 | 'clearHistory'
 | 'clipsThumbnail'
 | 'compactView'
 | 'dangerousDelete'
 | 'darkMode'
 | 'doubleClickMode'
 | 'dragVideoOutOfApp'
 | 'duplicateHash'
 | 'duplicateLength'
 | 'duplicateSize'
 | 'durationFilter'
 | 'exclude'
 | 'fileIntersection'
 | 'fileUnion'
 | 'flatIcons'
 | 'folderIntersection'
 | 'folderUnion'
 | 'fontSizeLarger'
 | 'fuzzy'
 | 'hideOffline'
 | 'hideSidebar'
 | 'hideTop'
 | 'hoverScrub'
 | 'magic'
 | 'makeLarger'
 | 'makeSmaller'
 | 'manualTags'
 | 'muteClips'
 | 'openAtTimestamp'
 | 'playPlaylist'
 | 'randomizeFoldersScreenshots'
 | 'regex'
 | 'resetSettings'
 | 'resolutionFilter'
 | 'returnToFirstScreenshot'
 | 'showClips'
 | 'showDeleteOption'
 | 'showDetails'
 | 'showDetails2'
 | 'showDetailsTray'
 | 'showFiles'
 | 'showFilmstrip'
 | 'showFolders'
 | 'showFreq'
 | 'showFullView'
 | 'showMoreInfo'
 | 'showRecent'
 | 'showRecentlyPlayed'
 | 'showRelatedVideosTray'
 | 'showTagTray'
 | 'showTags'
 | 'showThumbnails'
 | 'showVideoNotes'
 | 'shuffleGalleryNow'
 | 'sizeFilter'
 | 'sortOptionAlphabetical'
 | 'sortOptionAlphabetical2'
 | 'sortOptionAspectRatio'
 | 'sortOptionCreated'
 | 'sortOptionFolderSize'
 | 'sortOptionModified'
 | 'sortOptionSize'
 | 'sortOptionStar'
 | 'sortOptionTags'
 | 'sortOptionTime'
 | 'sortOptionTimesPlayed'
 | 'sortOptionYear'
 | 'sortOrder'
 | 'starFilter'
 | 'startWizard'
 | 'tagExclusion'
 | 'tagIntersection'
 | 'tagUnion'
 | 'thumbAutoAdvance'
 | 'videoNotes';

// Add `SettingsButtons` items here so they show up in the buttons ribbon and in the settings
// Each array separates buttons into their own button groups visually
export const SettingsButtonsGroups: SettingsButtonKey[][] = [
  [ // 0
    'hideSidebar',
  ],
  [ // 1
    'folderUnion',
    'folderIntersection',
    'fileUnion',
    'fileIntersection',
    'exclude',
    'tagUnion',
    'tagIntersection',
    'tagExclusion',
    'videoNotes',
    'magic',
    'regex',
    'fuzzy',
  ],
  [ // 2
    'durationFilter',
    'sizeFilter',
    'resolutionFilter',
    'starFilter',
    'sortOrder',
    'hideOffline',
    'sortOptionAlphabetical',
    'sortOptionAlphabetical2',
    'sortOptionTime',
    'sortOptionSize',
    'sortOptionTimesPlayed',
    'sortOptionStar',
    'sortOptionYear',
    'sortOptionModified',
    'sortOptionCreated',
    'sortOptionTags',
    'sortOptionAspectRatio',
    'sortOptionFolderSize'

  ],
  [ // 3
    'duplicateLength',
    'duplicateSize',
    'duplicateHash',
    'showRecent'
  ],
  [ // 4
    'showThumbnails',
    'showFilmstrip',
    'showFullView',
    'showDetails',
    'showDetails2',
    'showFiles',
    'showClips',
  ],
  [ // 5
    'showFolders',
    'randomizeFoldersScreenshots',
  ],
  [ // 6
    'showFreq',
    'showTagTray',
    'showRelatedVideosTray',
    'showRecentlyPlayed',
    'showDetailsTray'
  ],
  [ // 7
    'compactView',
    'showMoreInfo',
    'fontSizeLarger',
    'shuffleGalleryNow',
  ],
  [ // 8
    'showTags',
    'autoFileTags',
    'autoFolderTags',
  ],
  [ // 9
    'manualTags',

    'showVideoNotes',
  ],
  [ // 10
    'hoverScrub',
    'thumbAutoAdvance',
    'returnToFirstScreenshot',
  ],
  [ // 11
    'muteClips',
    'autoplayClips',
    'clipsThumbnail',
  ],
  [ // 12
    'makeSmaller',
    'makeLarger',
  ],
  [ // 13
    'darkMode',
    'doubleClickMode',
    'dragVideoOutOfApp',
  ],
  [ // 14
    'hideTop',
    'flatIcons'
  ],
  [ // 15
    'startWizard',
    'resetSettings',
    'clearHistory',
    'showDeleteOption',
    'dangerousDelete',
    'playPlaylist',
    'openAtTimestamp'
  ]
];

// Breaks up content into 3 tabs
export const SettingsMetaGroup: string[][] = [
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
    'break',
    ...SettingsButtonsGroups[14],
  ],
  [
    ...SettingsButtonsGroups[15],
  ],
];

// correspond to each group (tab) above
export const SettingsMetaGroupLabels: string[] = [
  'SETTINGS.searchAndFilter',
  'SETTINGS.galleryAndView',
  'SETTINGS.otherSettings',
];

export type SettingsButtonsType = { [key in SettingsButtonKey]: SettingsButton };

export const SettingsButtons: SettingsButtonsType = {
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
    title: 'BUTTONS.clearHistoryHint',
    toggled: false
  },
  'clipsThumbnail': {
    description: 'BUTTONS.clipsThumbnailDescription',
    hidden: true,
    moreInfo: 'BUTTONS.clipsThumbnailMoreInfo',
    title: 'BUTTONS.clipsThumbnailHint',
    toggled: false
  },
  'compactView': {
    description: 'BUTTONS.compactViewDescription',
    hidden: false,
    iconName: 'icon-compact-view',
    moreInfo: 'BUTTONS.compactViewMoreInfo',
    settingsHeading: 'SETTINGS.miscView',
    title: 'BUTTONS.compactViewHint',
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
  'doubleClickMode': {
    description: 'BUTTONS.doubleClickModeDescription',
    hidden: true,
    iconName: 'icon-double-click',
    settingsHeading: 'SETTINGS.doubleClickMode',
    moreInfo: 'BUTTONS.doubleClickMoreInfo',
    title: 'BUTTONS.doubleClickModeHint',
    toggled: false
  },
  'dragVideoOutOfApp': {
    description: 'BUTTONS.dragVideoOutOfAppDescription',
    hidden: true,
    iconName: 'icon-double-click',
    moreInfo: 'BUTTONS.dragVideoOutOfAppMoreInfo',
    settingsHeading: 'SETTINGS.dragVideoOutOfApp',
    title: 'BUTTONS.dragVideoOutOfAppHint',
    toggled: false
  },
  'duplicateHash': {
    description: 'BUTTONS.duplicateHashDescription',
    hidden: true,
    moreInfo: 'BUTTONS.duplicateHashMoreInfo',
    title: 'BUTTONS.duplicateHashHint',
    toggled: false
  },
  'duplicateLength': {
    description: 'BUTTONS.duplicateLengthDescription',
    hidden: true,
    moreInfo: 'BUTTONS.duplicateLengthMoreInfo',
    settingsHeading: 'SETTINGS.duplicateLength',
    title: 'BUTTONS.duplicateLengthHint',
    toggled: false
  },
  'duplicateSize': {
    description: 'BUTTONS.duplicateSizeDescription',
    hidden: true,
    moreInfo: 'BUTTONS.duplicateSizeMoreInfo',
    title: 'BUTTONS.duplicateSizeHint',
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
  'sizeFilter': {
    description: 'BUTTONS.sizeFilterDescription',
    hidden: false,
    iconName: 'icon-sort-order',
    moreInfo: 'BUTTONS.sizeFilterMoreInfo',
    title: 'BUTTONS.sizeFilterHint',
    toggled: false
  },
  'exclude': {
    description: 'BUTTONS.excludeDescription',
    hidden: true,
    iconName: 'icon-video-x',
    moreInfo: 'BUTTONS.excludeMoreInfo',
    title: 'BUTTONS.excludeHint',
    toggled: false
  },
  'fileIntersection': {
    description: 'BUTTONS.fileDescription',
    hidden: false,
    iconName: 'icon-video-minus',
    moreInfo: 'BUTTONS.fileMoreInfo',
    title: 'BUTTONS.fileHint',
    toggled: true
  },
  'fileUnion': {
    description: 'BUTTONS.fileUnionDescription',
    hidden: true,
    iconName: 'icon-video-plus',
    moreInfo: 'BUTTONS.fileUnionMoreInfo',
    title: 'BUTTONS.fileUnionHint',
    toggled: false
  },
  'videoNotes': {
    description: 'BUTTONS.videoNotesDescription',
    hidden: true,
    iconName: 'icon-toggle-video-notes',
    moreInfo: 'BUTTONS.videoNotesMoreInfo',
    title: 'BUTTONS.videoNotesHint',
    toggled: false
  },
  'flatIcons': {
    description: 'BUTTONS.flatIconsDescription',
    hidden: false,
    settingsHeading: 'SETTINGS.buttonStyle',
    title: 'BUTTONS.flatIconsHint',
    toggled: false
  },
  'folderIntersection': {
    description: 'BUTTONS.folderDescription',
    hidden: false,
    iconName: 'icon-folder-minus',
    moreInfo: 'BUTTONS.folderMoreInfo',
    title: 'BUTTONS.folderHint',
    toggled: true
  },
  'folderUnion': {
    description: 'BUTTONS.folderUnionDescription',
    hidden: true,
    iconName: 'icon-folder-plus',
    moreInfo: 'BUTTONS.folderUnionMoreInfo',
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
  'fuzzy': {
    description: 'BUTTONS.fuzzyDescription',
    hidden: false,
    iconName: 'icon-show-similar',
    moreInfo: 'BUTTONS.fuzzyMoreInfo',
    title: 'BUTTONS.fuzzyHint',
    toggled: true
  },
  'hideOffline': {
    description: 'BUTTONS.hideOfflineDescription',
    hidden: true,
    iconName: 'icon-eye-closed',
    moreInfo: 'BUTTONS.hideOfflineMoreInfo',
    title: 'BUTTONS.hideOfflineHint',
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
    hidden: true,
    iconName: 'icon-toggle-scrub',
    moreInfo: 'BUTTONS.hoverScrubMoreInfo',
    settingsHeading: 'SETTINGS.thumbnailHeading',
    title: 'BUTTONS.hoverScrubHint',
    toggled: true
  },
  'magic': {
    description: 'BUTTONS.magicDescription',
    hidden: false,
    iconName: 'icon-looking-glass',
    moreInfo: 'BUTTONS.magicMoreInfo',
    title: 'BUTTONS.magicHint',
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
    settingsHeading: 'BUTTONS.videoPlayerSettings',
    title: 'BUTTONS.openAtTimestampHint',
    toggled: false
  },
  'playPlaylist': {
    description: 'BUTTONS.playlistButtonDescription',
    hidden: true,
    iconName: 'icon-video-blank',
    moreInfo: 'BUTTONS.playlistButtonMoreInfo',
    title: 'BUTTONS.playlistButton',
    toggled: false
  },
  'randomizeFoldersScreenshots': {
    description: 'BUTTONS.randFolderScreenDesc',
    hidden: true,
    title: 'BUTTONS.randFolderScreen',
    toggled: true
  },
  'regex': {
    description: 'BUTTONS.regexDescription',
    hidden: true,
    iconName: 'icon-regex',
    moreInfo: 'BUTTONS.regexMoreInfo',
    title: 'BUTTONS.regexHint',
    toggled: false
  },
  'resetSettings': {
    description: 'BUTTONS.resetSettingsDescription',
    hidden: false,
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
    hidden: true,
    iconName: 'icon-toggle-scrub-return',
    moreInfo: 'BUTTONS.returnToFirstScreenshotMoreInfo',
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
  'showDeleteOption': {
    description: 'BUTTONS.showDeleteButtonDescription',
    hidden: true,
    moreInfo: 'BUTTONS.showDeleteButtonMoreInfo',
    title: 'BUTTONS.showDeleteButton',
    toggled: false
  },
  'dangerousDelete': {
    description: 'BUTTONS.dangerousDeleteDescription',
    hidden: true,
    moreInfo: 'BUTTONS.dangerousDeleteMoreInfo',
    title: 'BUTTONS.dangerousDelete',
    toggled: false
  },
  'showDetails': {
    description: 'BUTTONS.showDetailsDescription',
    hidden: false,
    iconName: 'icon-show-details',
    title: 'BUTTONS.showDetailsHint',
    toggled: false
  },
  'showDetails2': {
    description: 'BUTTONS.showDetails2Description',
    hidden: false,
    iconName: 'icon-show-details-2',
    title: 'BUTTONS.showDetails2Hint',
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
    hidden: false,
    iconName: 'icon-folder-blank',
    moreInfo: 'BUTTONS.showFoldersMoreInfo',
    settingsHeading: 'SETTINGS.folderView',
    title: 'BUTTONS.showFoldersHint',
    toggled: false
  },
  'showFreq': {
    description: 'BUTTONS.showFreqDescription',
    hidden: false,
    iconName: 'icon-cloud',
    moreInfo: 'BUTTONS.showFreqMoreInfo',
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
  'showRecent': {
    description: 'BUTTONS.showRecentDescription',
    hidden: false,
    iconName: 'icon-recent-history',
    settingsHeading: 'SETTINGS.showRecent',
    title: 'BUTTONS.showRecentHint',
    toggled: false
  },
  'showRecentlyPlayed': {
    description: 'BUTTONS.showRecentPlayed',
    hidden: false,
    iconName: 'icon-recent-history',
    title: 'BUTTONS.showRecentPlayed',
    toggled: false
  },
  'showDetailsTray': {
    description: 'BUTTONS.showDetailsTray',
    hidden: false,
    iconName: 'icon-show-details-tray',
    moreInfo: 'BUTTONS.showDetailsTrayMoreInfo',
    title: 'BUTTONS.showDetailsTray',
    toggled: false
  },
  'showRelatedVideosTray': {
    description: 'BUTTONS.relatedTrayDescription',
    hidden: false,
    iconName: 'icon-show-similar',
    moreInfo: 'BUTTONS.relatedTrayMoreInfo',
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
    moreInfo: 'BUTTONS.sortOptionAlphabeticalMoreInfo',
    settingsHeading: 'BUTTONS.sortOptionsHeading',
    title: '',
    toggled: true
  },
  'sortOptionAlphabetical2': {
    description: 'BUTTONS.sortOptionAlphabeticalDescription2',
    hidden: false,
    moreInfo: 'BUTTONS.sortOptionAlphabeticalMoreInfo2',
    title: '',
    toggled: false
  },
  'sortOptionAspectRatio': {
    description: 'BUTTONS.sortOptionAspectRatioDescription',
    hidden: false,
    moreInfo: 'BUTTONS.sortOptionAspectRatioMoreInfo',
    title: '',
    toggled: false
  },
  'sortOptionFolderSize': {
    description: 'BUTTONS.sortOptionFolderSizeDescription',
    hidden: false,
    moreInfo: 'BUTTONS.sortOptionFolderSizeMoreInfo',
    title: '',
    toggled: false
  },
  'sortOptionModified': {
    description: 'BUTTONS.sortOptionModifiedDescription',
    hidden: false,
    moreInfo: 'BUTTONS.sortOptionModifiedMoreInfo',
    title: '',
    toggled: true
  },
  'sortOptionCreated': {
    description: 'BUTTONS.sortOptionCreatedDescription',
    hidden: false,
    moreInfo: 'BUTTONS.sortOptionCreatedMoreInfo',
    title: '',
    toggled: false
  },
  'sortOptionSize': {
    description: 'BUTTONS.sortOptionSizeDescription',
    hidden: false,
    moreInfo: 'BUTTONS.sortOptionSizeMoreInfo',
    title: '',
    toggled: true
  },
  'sortOptionStar': {
    description: 'BUTTONS.sortOptionStarDescription',
    hidden: false,
    moreInfo: 'BUTTONS.sortOptionStarMoreInfo',
    title: '',
    toggled: false
  },
  'sortOptionTags': {
    description: 'BUTTONS.sortOptionTagsDescription',
    hidden: false,
    moreInfo: 'BUTTONS.sortOptionTagsMoreInfo',
    title: '',
    toggled: false
  },
  'sortOptionTime': {
    description: 'BUTTONS.sortOptionTimeDescription',
    hidden: false,
    moreInfo: 'BUTTONS.sortOptionTimeMoreInfo',
    title: '',
    toggled: true
  },
  'sortOptionTimesPlayed': {
    description: 'BUTTONS.sortOptionTimesPlayedDescription',
    hidden: false,
    moreInfo: 'BUTTONS.sortOptionTimesPlayedMoreInfo',
    title: '',
    toggled: false
  },
  'sortOptionYear': {
    description: 'BUTTONS.sortOptionYearDescription',
    hidden: false,
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
    toggled: true
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
    title: 'BUTTONS.startWizardHint',
    toggled: false
  },
  'tagExclusion': {
    description: 'BUTTONS.tagExclusionDescription',
    hidden: true,
    iconName: 'icon-tag-x',
    moreInfo: 'BUTTONS.tagExclusionMoreInfo',
    title: 'BUTTONS.tagExclusionHint',
    toggled: false
  },
  'tagIntersection': {
    description: 'BUTTONS.tagIntersectionDescription',
    hidden: true,
    iconName: 'icon-tag-minus',
    moreInfo: 'BUTTONS.tagIntersectionMoreInfo',
    title: 'BUTTONS.tagIntersectionHint',
    toggled: false
  },
  'tagUnion': {
    description: 'BUTTONS.tagUnionDescription',
    hidden: true,
    iconName: 'icon-tag-plus',
    moreInfo: 'BUTTONS.tagUnionMoreInfo',
    title: 'BUTTONS.tagUnionHint',
    toggled: false
  },
  'thumbAutoAdvance': {
    description: 'BUTTONS.thumbAutoAdvanceDescription',
    hidden: true,
    iconName: 'icon-toggle-auto-scrub',
    moreInfo: 'BUTTONS.thumbAutoAdvanceMoreInfo',
    title: 'BUTTONS.thumbAutoAdvanceHint',
    toggled: false
  },
  'showVideoNotes': {
    description: 'BUTTONS.showVideoNotesDescription',
    hidden: true,
    iconName: 'icon-toggle-video-notes',
    moreInfo: 'BUTTONS.showVideoNotesMoreInfo',
    title: 'BUTTONS.showVideoNotesHint',
    toggled: false
  }
}
