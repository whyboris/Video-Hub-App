// string = search string, array = array of filters, bool = dummy to flip to trigger pipe
// array for `file`, `fileUnion`, `folder`, `folderUnion`
export let Filters = [
  {
    uniqueKey: 'folderUnion',
    string: '',
    array: [], // contains search strings
    bool: true,
    placeholder: 'Folder union',
    conjunction: 'or'
  }, {
    uniqueKey: 'folder',
    string: '',
    array: [],
    bool: true,
    placeholder: 'Folder contains',
    conjunction: 'and'
  }, {
    uniqueKey: 'fileUnion',
    string: '',
    array: [],
    bool: true,
    placeholder: 'File union',
    conjunction: 'or'
  }, {
    uniqueKey: 'file',
    string: '',
    array: [],
    bool: true,
    placeholder: 'File contains',
    conjunction: 'and',
  }
];
