import { Component, OnInit } from '@angular/core';

import { ElectronService } from '../../providers/electron.service';

import { FinalObject } from '../common/final-object.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss',
              './search.component.scss',
              './gallery.component.scss',
              './photon/photon.min.css',
              './film-override.scss']
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

  selectedOutputFolder = 'no output chosen'; // later = ''
  selectedSourceFolder = 'no source chosen';  // later = ''

  currentPlayingFile = '';
  currentPlayingFolder = '';

  importDone = false;
  progressPercent = 0;

  public finalArray = [];

  constructor(
    public electronService: ElectronService
  ) { }

  ngOnInit() {

    this.electronService.ipcRenderer.on('finalObjectReturning', (event, finalObject: FinalObject) => {
      this.selectedOutputFolder = finalObject.outputDir;
      this.selectedSourceFolder = finalObject.inputDir;
      this.finalArray = finalObject.images;
    });

    this.electronService.ipcRenderer.on('selected-directory', (event, files) => {
      this.selectedSourceFolder = files;
    });

    this.electronService.ipcRenderer.on('outputFolderChosen', (event, files) => {
      this.selectedOutputFolder = files;
    });

    this.electronService.ipcRenderer.on('processingProgress', (event, a, b) => {
      console.log(a + ' out of ' + b);
      this.progressPercent = a / b;
      if (a === b) {
        this.importDone = true;
      }
    });

  }

  public importFresh() {
    console.log('fresh import');
    this.electronService.ipcRenderer.send('open-file-dialog', 'sending some message');
  }

  public selectOutputDirectory() {
    console.log('select output directory');
    this.electronService.ipcRenderer.send('choose-output', 'sending some message also');
  }

  public loadFromFile() {
    console.log('loading file');
    this.electronService.ipcRenderer.send('load-the-file', 'some thing sent');
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
    console.log('sike! DISABLED :)')
    // this.electronService.ipcRenderer.send('openThisFile', fullPath);
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
