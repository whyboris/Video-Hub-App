import { Colors } from './colors';

interface FilterObject {
  uniqueKey: string;
  string: string;  // search string
  array: string[]; // container for all search strings
  bool: boolean;   // dummy to flip the trigger pipe
  placeholder: string;
  conjunction: string;
  color: string;
}

export const FilterKeyNames: string[] = [
  'folderUnion',        // [0]
  'folderIntersection', // [1]
  'folderExclusion',    // [2]
  'fileUnion',          // [3]
  'fileIntersection',   // [4]
  'exclude',            // [5]
  'tagUnion',           // [6]
  'tagIntersection',    // [7]
  'tagExclusion',       // [8]
  'videoNotes',         // [9]
];

export const Filters: FilterObject[] = [
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
    uniqueKey: 'folderExclusion',
    string: '',
    array: [],
    bool: true,
    placeholder: 'SIDEBAR.folderExclusion',
    conjunction: 'SIDEBAR.or',
    color: Colors.folderExclusion
  },{
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
  }, {
    uniqueKey: 'videoNotes',
    string: '',
    array: [],
    bool: true,
    placeholder: 'SIDEBAR.videoNotes',
    conjunction: 'SIDEBAR.and',
    color: Colors.videoNotes
  }
];

export const filterKeyToIndex = {
  folderUnion: 0,
  folderIntersection: 1,
  folderExclusion: 2,
  fileUnion: 3,
  fileIntersection: 4,
  exclude: 5,
  tagUnion: 6,
  tagIntersection: 7,
  tagExclusion: 8,
  videoNotes: 9,
};
