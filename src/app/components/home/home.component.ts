import { Component, OnInit } from '@angular/core';

import { ElectronService } from '../../providers/electron.service';

import { FinalObject } from '../common/final-object.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss',
              './search.scss',
              './gallery.scss',
              './photon/photon.min.css',
              './film-override.scss',
              './wizard.scss']
})
export class HomeComponent implements OnInit {

  searchOptions = {
    folder: true,
    file: true,
    magic: true,
    thumbNotFilm: true,
    showFileName: true
  };

  numberToShow = 10;

  folderSearchString = '';
  folderSearchStringSaved = '';

  fileSearchString = '';
  fileSearchStringSaved = '';

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

  onFolderEnter(value: string) {
    console.log(value);
    this.folderSearchString = '';
    this.folderSearchStringSaved = value;
  }

  onFileEnter(value: string) {
    this.fileSearchString = '';
    this.fileSearchStringSaved = value;
  }

  toggleThis(button: string) {
    this.searchOptions[button] = !this.searchOptions[button];
  }

}
