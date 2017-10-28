import { Component, OnInit, HostListener } from '@angular/core';

import { ElectronService } from '../../providers/electron.service';

import { FinalObject } from '../common/final-object.interface';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: [
    './home.component.scss',
    './search.scss',
    './photon/photon.min.css',
    './gallery.scss',
    './film-override.scss',
    './wizard.scss'
  ]
})
export class HomeComponent implements OnInit {

  searchOptions = {
    folderUnion: true,
    folder: true, // whether to show or hide
    fileUnion: true,
    file: true,
    magic: true,
    // type galleryView = 'thumbs' | 'filmstrip' | 'files'
    galleryView: 'thumbs',
    showFileName: true,
    gallerySettingsToggle: true
  };

  numberToShow = 10;

  // string = search string, array = array of filters, bool = dummy to flip to trigger pipe
  // array for `file`, `fileUnion`, `folder`, `folderUnion`
  filters = [
    {
     uniqueKey: 'folderUnion',
     string: '',
     array: [],
     bool: true,
     placeholder: 'Search folders union',
     conjunction: 'or'
    }, {
      uniqueKey: 'folder',
      string: '',
      array: [],
      bool: true,
      placeholder: 'Search folders',
      conjunction: 'and'
    }, {
      uniqueKey: 'fileUnion',
      string: '',
      array: [],
      bool: true,
      placeholder: 'Search files union',
      conjunction: 'or'
    }, {
      uniqueKey: 'file',
      string: '',
      array: [],
      bool: true,
      placeholder: 'Search files',
      conjunction: 'and',
    }
  ]

  magicSearchString = '';

  selectedOutputFolder = ''; // later = ''
  selectedSourceFolder = '';  // later = ''

  currentPlayingFile = '';
  currentPlayingFolder = '';

  importDone = false;
  inProgress = false;
  progressPercent = 0;


  public finalArray = [];

  constructor(
    public electronService: ElectronService
  ) { }

  ngOnInit() {
    // Returning Input
    this.electronService.ipcRenderer.on('inputFolderChosen', (event, filePath) => {
      this.selectedSourceFolder = filePath;
    });

    // Returning Output
    this.electronService.ipcRenderer.on('outputFolderChosen', (event, filePath) => {
      this.selectedOutputFolder = filePath;
    });

    // Progress bar messages
    this.electronService.ipcRenderer.on('processingProgress', (event, a, b) => {
      this.inProgress = true; // handle this variable better later
      console.log(a + ' out of ' + b);
      this.progressPercent = a / b;
    });

    // Final object returns
    this.electronService.ipcRenderer.on('finalObjectReturning', (event, finalObject: FinalObject) => {
      this.selectedOutputFolder = finalObject.outputDir;
      this.selectedSourceFolder = finalObject.inputDir;
      this.importDone = true;
      this.finalArray = finalObject.images;
    });
  }

  public loadFromFile() {
    // console.log('loading file');
    this.electronService.ipcRenderer.send('load-the-file', 'some thing sent');
  }

  public selectSourceDirectory() {
    // console.log('select input directory');
    this.electronService.ipcRenderer.send('choose-input', 'sending some message also');
  }

  public selectOutputDirectory() {
    // console.log('select output directory');
    this.electronService.ipcRenderer.send('choose-output', 'sending some message also');
  }

  public importFresh() {
    // console.log('fresh import');
    this.electronService.ipcRenderer.send('start-the-import', 'sending some message');
  }

  // HTML calls this
  public openVideo(number) {
    console.log('trying to open video');

    this.currentPlayingFolder = this.finalArray[number][0];
    this.currentPlayingFile = this.finalArray[number][2];

    this.openExternalFile(this.selectedSourceFolder + this.finalArray[number][0] + '/' + this.finalArray[number][1]);
  }

  // Open the file in system default program
  public openExternalFile(fullPath) {
    console.log('trying to open ' + fullPath);
    // console.log('sike! DISABLED :)')
    this.electronService.ipcRenderer.send('openThisFile', fullPath);
  }

  toggleThis(button: string) {
    this.searchOptions[button] = !this.searchOptions[button];
  }

  switchGalleryView(view: string) {
    this.searchOptions.galleryView = view;
  }

  /**
   * Add search string to filter array
   * @param value  -- the string to filter
   * @param origin -- can be `file`, `fileUnion`, `folder`, `folderUnion` -- KEYS for the `filters` Array
   */
  onEnterGeneral(value: string, origin: string): void {
    console.log(origin);
    console.log(value);
    const trimmed = value.trim();
    if (trimmed) {
      this.filters[origin].array.push(trimmed);
      this.filters[origin].bool = !this.filters[origin].bool;
      this.filters[origin].string = '';
    }
  }

  removeThisOneGeneral(item: number, origin: string): void {
    this.filters[origin].array.splice(item, 1);
    this.filters[origin].bool = !this.filters[origin].bool;
  }

}
