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
    thumbNotFilm: true
  };


  title = `App works !`;

  numberToShow = 10;

  folderSearchString = '';
  folderSearchStringSaved = '';

  fileSearchString = '';
  fileSearchStringSaved = '';

  magicSearchString = '';

  selectedSourceFolder = '/Users/byakubchik/Desktop/VideoHub/input';  // later = ''
  selectedOutputFolder = '/Users/byakubchik/Desktop/VideoHub/output'; // later = ''

  currentPlayingFile = '';
  currentPlayingFolder = '';

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
      console.log(files[0]);
      this.changeDisplayedPath(files[0]);
    });

  }

  public importFresh() {
    console.log('fresh import');
    this.electronService.ipcRenderer.send('open-file-dialog', 'sending some message');
  }

  public loadFromFile() {
    console.log('loading file');
    this.electronService.ipcRenderer.send('load-the-file', 'some thing sent');
  }

  public changeDisplayedPath(thePathString: string): void {
    this.selectedSourceFolder = thePathString;
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
