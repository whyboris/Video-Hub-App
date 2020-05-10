// Let's make these identical to settings buttons!
export type SupportedView = 'showThumbnails'
  | 'showFilmstrip'
  | 'showFullView'
  | 'showDetails'
  | 'showDetails2'
  | 'showFiles'
  | 'showClips';

export const allSupportedViews: SupportedView[] = [
  'showThumbnails',
  'showFilmstrip',
  'showFullView',
  'showDetails',
  'showDetails2',
  'showFiles',
  'showClips',
];

// Tags stuffs
export interface Tag {
  name: string;
  colour: string;
  removable: boolean;
}

export interface TagEmit {
  tag: Tag;
  event: Event;
};

export interface TagEmission {
  index: number;
  tag: string;
  type: 'add' | 'remove';
}
