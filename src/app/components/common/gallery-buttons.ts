export const GalleryButtonsOrder = [
  'showThumbnails',
  'showFilmstrip',
  'showFiles',
  'makeSmaller',
  'makeLarger',
  'darkMode',
  'showMoreInfo',
  'fontSizeLarger',
  'hoverDisabled',
  'randomImage'
]

export let GalleryButtons = {
  'showThumbnails': {
    hidden: false,
    toggled: true,
    iconName: 'icon-layout',
    title: 'Show thumbnails',
    spaceAfter: false,
    description: 'Show thumbnails view'
  },
  'showFilmstrip': {
    hidden: false,
    toggled: false,
    iconName: 'icon-menu',
    title: 'Show filmstrip',
    spaceAfter: false,
    description: 'Show filmstrip view'
  },
  'showFiles': {
    hidden: false,
    toggled: false,
    iconName: 'icon-menu',
    title: 'Show files',
    spaceAfter: true,
    description: 'Show files view'
  },
  'showMoreInfo': {
    hidden: false,
    toggled: true,
    iconName: 'icon-tag',
    title: 'Show more info',
    spaceAfter: false,
    description: 'Show more info'
  },
  'fontSizeLarger': {
    hidden: false,
    toggled: false,
    iconName: 'icon-resize-full',
    title: 'Toggle font size',
    spaceAfter: false,
    description: 'Make the font larger or smaller'
  },
  'hoverDisabled': {
    hidden: false,
    toggled: false,
    iconName: 'icon-feather',
    title: 'Toggle hover animations',
    spaceAfter: false,
    description: 'Scrolling over preview shows different screenshots'
  },
  'randomImage': {
    hidden: false,
    toggled: true,
    iconName: 'icon-shuffle',
    title: 'Show random screenshot',
    spaceAfter: true,
    description: 'Show random screenshot in the preview'
  },
  'makeSmaller': {
    hidden: false,
    toggled: false,
    iconName: 'icon-minus',
    title: 'Decrease preview size',
    spaceAfter: false,
    description: 'Decrease preview size'
  },
  'makeLarger': {
    hidden: false,
    toggled: false,
    iconName: 'icon-plus',
    title: 'Increase preview size',
    spaceAfter: true,
    description: 'Increase preview size'
  },
  'darkMode': {
    hidden: false,
    toggled: false,
    iconName: 'icon-adjust',
    title: 'Dark mode',
    spaceAfter: true,
    description: 'Dark mode'
  }
}
