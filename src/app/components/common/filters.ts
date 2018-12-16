// string = search string, array = array of filters, bool = dummy to flip to trigger pipe
// array for `file`, `fileUnion`, `folder`, `folderUnion`, and `exclude`
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
    uniqueKey: 'folder',
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
    uniqueKey: 'file',
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
  }
];
