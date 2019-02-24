// array for `fileIntersection`, `fileUnion`, `folderIntersection`, `folderUnion`, and `exclude`
// string = search string
// array = array of filters
// bool = dummy to flip to trigger pipe

export const FilterKeyNames: string[] = [
  'folderUnion',
  'folderIntersection',
  'fileUnion',
  'fileIntersection',
  'exclude',
  'tagUnion',
  'tagIntersection',
  'tagExclusion',
];

export let Filters = [
  {
    uniqueKey: 'folderUnion',
    string: '',
    array: [], // contains search strings
    bool: true,
    placeholder: 'SIDEBAR.folderUnion',
    conjunction: 'SIDEBAR.or',
    color: '#FFD672'
  }, {
    uniqueKey: 'folderIntersection',
    string: '',
    array: [],
    bool: true,
    placeholder: 'SIDEBAR.folder',
    conjunction: 'SIDEBAR.and',
    color: '#ffe5a5'
  }, {
    uniqueKey: 'fileUnion',
    string: '',
    array: [],
    bool: true,
    placeholder: 'SIDEBAR.fileUnion',
    conjunction: 'SIDEBAR.or',
    color: '#6e96ff'
  }, {
    uniqueKey: 'fileIntersection',
    string: '',
    array: [],
    bool: true,
    placeholder: 'SIDEBAR.file',
    conjunction: 'SIDEBAR.and',
    color: '#b1c6fd'
  }, {
    uniqueKey: 'exclude',
    string: '',
    array: [],
    bool: true,
    placeholder: 'SIDEBAR.exclude',
    conjunction: 'SIDEBAR.or',
    color: '#FF8888'
  }, {
    uniqueKey: 'tagUnion',
    string: '',
    array: [],
    bool: true,
    placeholder: 'SIDEBAR.tagUnion',
    conjunction: 'SIDEBAR.or',
    color: '#6e96ff'
  }, {
    uniqueKey: 'tagIntersection',
    string: '',
    array: [],
    bool: true,
    placeholder: 'SIDEBAR.tagIntersection',
    conjunction: 'SIDEBAR.and',
    color: '#b1c6fd'
  }, {
    uniqueKey: 'tagExclusion',
    string: '',
    array: [],
    bool: true,
    placeholder: 'SIDEBAR.tagExclusion',
    conjunction: 'SIDEBAR.or',
    color: '#FF8888'
  }
];

export const filterKeyToIndex = {
  folderUnion: 0,
  folderIntersection: 1,
  fileUnion: 2,
  fileIntersection: 3,
  exclude: 4,
  tagUnion: 5,
  tagIntersection: 6,
  tagExclusion: 7,
};
