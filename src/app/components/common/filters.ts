import { Colors } from './colors';

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

interface FilterObject {
  uniqueKey: string;
  string: string;
  array: string[]; // container for all search strings
  bool: boolean;
  placeholder: string;
  conjunction: string;
  color: string;
}

export let Filters: FilterObject[] = [
  {
    uniqueKey: 'folderUnion',
    string: '',
    array: [],
    bool: true,
    placeholder: 'SIDEBAR.folderUnion',
    conjunction: 'SIDEBAR.or',
    color: Colors.folderUnion
  }, {
    uniqueKey: 'folderIntersection',
    string: '',
    array: [],
    bool: true,
    placeholder: 'SIDEBAR.folder',
    conjunction: 'SIDEBAR.and',
    color: Colors.folderIntersection
  }, {
    uniqueKey: 'fileUnion',
    string: '',
    array: [],
    bool: true,
    placeholder: 'SIDEBAR.fileUnion',
    conjunction: 'SIDEBAR.or',
    color: Colors.fileUnion
  }, {
    uniqueKey: 'fileIntersection',
    string: '',
    array: [],
    bool: true,
    placeholder: 'SIDEBAR.file',
    conjunction: 'SIDEBAR.and',
    color: Colors.fileIntersection
  }, {
    uniqueKey: 'exclude',
    string: '',
    array: [],
    bool: true,
    placeholder: 'SIDEBAR.exclude',
    conjunction: 'SIDEBAR.or',
    color: Colors.exclude
  }, {
    uniqueKey: 'tagUnion',
    string: '',
    array: [],
    bool: true,
    placeholder: 'SIDEBAR.tagUnion',
    conjunction: 'SIDEBAR.or',
    color: Colors.tagUnion
  }, {
    uniqueKey: 'tagIntersection',
    string: '',
    array: [],
    bool: true,
    placeholder: 'SIDEBAR.tagIntersection',
    conjunction: 'SIDEBAR.and',
    color: Colors.tagIntersection
  }, {
    uniqueKey: 'tagExclusion',
    string: '',
    array: [],
    bool: true,
    placeholder: 'SIDEBAR.tagExclusion',
    conjunction: 'SIDEBAR.or',
    color: Colors.tagExclusion
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
