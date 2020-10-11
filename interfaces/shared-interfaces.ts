import { ImageElement } from './final-object.interface';

// Let's make these identical to settings buttons!
export type SupportedView = 'showThumbnails'
  | 'showFilmstrip'
  | 'showFullView'
  | 'showDetails'
  | 'showDetails2'
  | 'showFiles'
  | 'showClips';

export const AllSupportedViews: SupportedView[] = [
  'showThumbnails',
  'showFilmstrip',
  'showFullView',
  'showDetails',
  'showDetails2',
  'showFiles',
  'showClips',
];

export type SupportedTrayView = 'showFreq'
                              | 'showRelatedVideosTray'
                              | 'showTagTray';


export const AllSupportedBottomTrayViews: SupportedTrayView[] = [
  'showFreq',
  'showRelatedVideosTray',
  'showTagTray',
];

// Mouse click events
export interface VideoClickEmit {
  mouseEvent: MouseEvent;
  thumbIndex?: number;
  doubleClick?: boolean;
}

export interface RightClickEmit {
  mouseEvent: Event;
  item: ImageElement;
}

// Tags stuffs
export interface Tag {
  name: string;
  colour: string;
  removable: boolean;
}

export interface TagEmit {
  tag: Tag;
  event: Event;
}

export interface TagEmission {
  index: number;
  tag: string;
  type: 'add' | 'remove';
}

export interface HistoryItem {
  vhaFilePath: string;
  hubName: string;
}

export interface RenameFileResponse {
  index: number;
  success: boolean;
  renameTo: string;
  oldFileName: string;
  errMsg?: string;
}
