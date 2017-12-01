// string = search string, array = array of filters, bool = dummy to flip to trigger pipe
// array for `file`, `fileUnion`, `folder`, `folderUnion`, and `exclude`
export let Filters = [
  {
    uniqueKey: 'folderUnion',
    string: '',
    array: [], // contains search strings
    bool: true,
    placeholder: 'Folder union',
    conjunction: 'or',
    color: '#FFD672'
  }, {
    uniqueKey: 'folder',
    string: '',
    array: [],
    bool: true,
    placeholder: 'Folder contains',
    conjunction: 'and',
    color: '#ffe5a5'
  }, {
    uniqueKey: 'fileUnion',
    string: '',
    array: [],
    bool: true,
    placeholder: 'File union',
    conjunction: 'or',
    color: '#6e96ff'
  }, {
    uniqueKey: 'file',
    string: '',
    array: [],
    bool: true,
    placeholder: 'File contains',
    conjunction: 'and',
    color: '#b1c6fd'
  }, {
    uniqueKey: 'exclude',
    string: '',
    array: [],
    bool: true,
    placeholder: 'File does not contain',
    conjunction: 'or',
    color: '#FF8888'
  }
];
