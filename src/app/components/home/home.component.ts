import { Component, ChangeDetectorRef, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';

import { setTimeout } from 'timers';

import { ElectronService } from '../../providers/electron.service';
import { ShowLimitService } from 'app/components/pipes/show-limit.service';
import { WordFrequencyService } from 'app/components/pipes/word-frequency.service';

import { FinalObject } from '../common/final-object.interface';

import { AppState } from '../common/app-state';
import { Filters } from '../common/filters';
import { SettingsButtons, SettingsButtonsGroups, SettingsCategories } from 'app/components/common/settings-buttons';

import { myAnimation, myAnimation2, myWizardAnimation } from '../common/animations';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: [
    './layout.scss',
    './settings.scss',
    './buttons.scss',
    './search.scss',
    './photon/buttons.scss',
    './photon/icons.scss',
    './gallery.scss',
    './film-override.scss',
    './wizard.scss'
  ],
  animations: [
    myAnimation,
    myAnimation2,
    myWizardAnimation
  ]
})
export class HomeComponent implements OnInit {

  @ViewChild('galleryArea') galleryDiv: ElementRef;

  settingsButtons = SettingsButtons;
  settingsButtonsGroups = SettingsButtonsGroups;
  settingsCategories = SettingsCategories;

  filters = Filters;

  // App state to save -- so it can be exported and saved when closing the app
  appState = AppState;

  // REORGANIZE / keep
  currentPlayingFile = '';
  currentPlayingFolder = '';
  magicSearchString = '';

  showWizard = true;

  importDone = false;
  inProgress = false;
  progressPercent = 0;

  appMaximized = false;

  imgHeight = 100;

  progressNum1 = 0;
  progressNum2 = 100;

  screenshotSizeForImport = 100;

  numberToShow = 5; // temporary 5 -- this limits how many thumbs shown

  myTimeout = null;

  buttonsInView = false;

  // temp variables for the wizard during import
  totalNumberOfFiles = -1;
  totalImportTime = 0;
  totalImportSize = 0;

  // temp
  wordFreqArr: any;
  currResults: any = { showing: 0, total: 0 };

  // for scroll
  galleryHeight = 3000;

  public finalArray = [];

  // Listen for key presses
  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event: KeyboardEvent) {
  //   console.log(event.key);
  // }

  @HostListener('window:resize', ['$event'])
  handleResizeEvent(event: any) {
    this.debounceUpdateMax();
  }

  constructor(
    public cd: ChangeDetectorRef,
    public showLimitService: ShowLimitService,
    public wordFrequencyService: WordFrequencyService,
    public electronService: ElectronService
  ) { }

  ngOnInit() {

    setTimeout(() => {
      this.wordFrequencyService.finalMapBehaviorSubject.subscribe((value) => {
        this.wordFreqArr = value;
        // this.cd.detectChanges();
      });
      this.showLimitService.searchResults.subscribe((value) => {
        this.currResults = value;
        this.cd.detectChanges();
        this.debounceUpdateMax(10);
      });
    }, 100);

    // Returning Input
    this.electronService.ipcRenderer.on('inputFolderChosen', (event, filePath, totalFilesInDir) => {
      this.totalNumberOfFiles = totalFilesInDir;
      // TODO better prediction
      this.totalImportTime = Math.round(totalFilesInDir * 2.25 / 60);
      this.appState.selectedSourceFolder = filePath;
    });

    // Returning Output
    this.electronService.ipcRenderer.on('outputFolderChosen', (event, filePath) => {
      this.appState.selectedOutputFolder = filePath;
    });

    // Progress bar messages
    this.electronService.ipcRenderer.on('processingProgress', (event, a, b) => {
      this.inProgress = true; // TODO handle this variable better later
      this.progressNum1 = a;
      this.progressNum2 = b;
      this.progressPercent = a / b;
    });

    // Final object returns
    this.electronService.ipcRenderer.on('finalObjectReturning', (event, finalObject: FinalObject) => {
      this.appState.numOfFolders = finalObject.numOfFolders;
      this.appState.selectedOutputFolder = finalObject.outputDir;
      this.appState.selectedSourceFolder = finalObject.inputDir;
      this.inProgress = false;
      this.importDone = true;
      this.showWizard = false;
      this.finalArray = finalObject.images;
      this.numberToShow = 5; // TEMP !!!!!!
    });

    // Returning settings
    this.electronService.ipcRenderer.on('settingsReturning', (event, settingsObject: any) => {
      this.restoreSettingsFromBefore(settingsObject);
      if (settingsObject.appState.selectedOutputFolder && settingsObject.appState.selectedSourceFolder) {
        this.loadThisJsonFile(settingsObject.appState.selectedOutputFolder + '/images.json');
      }
    });

    this.justStarted();
  }

  /**
   * Update max to view when scrolling
   */
  public scrollHandler(event) {
    this.debounceUpdateMax();
  }

  /**
   * Low-tech debounced scroll handler
   */
  public debounceUpdateMax(msDelay?: number): void {
    console.log('debouncing');
    const delay = msDelay !== undefined ? msDelay : 250;
    clearTimeout(this.myTimeout);
    this.myTimeout = setTimeout(() => {
      console.log('updating MAX !!!');
      this.updateMaxToShow();
    }, delay);
  }

  /**
   * Updates the `numberToShow` by computing available area in the `galleryDiv` (aka `galleryArea`)
   */
  public updateMaxToShow() {

    const clientHeight = this.galleryDiv.nativeElement.clientHeight;
    const clientWidth = this.galleryDiv.nativeElement.clientWidth;
    const scrollTop = this.galleryDiv.nativeElement.scrollTop;
    const scrollHeight = this.galleryDiv.nativeElement.scrollHeight;

    // TODO -- clean up function
    if (this.appState.currentView === 'thumbs') {
      const textPadding = (this.settingsButtons['showMoreInfo'].toggled ? 60 : 30);
      const galleryItemHeight = (this.imgHeight + textPadding);
      // rough estimate
      const showingHorizontally = Math.floor(clientWidth / (this.imgHeight * 1.69 + 30));
      const showingVertically = Math.floor(clientHeight / galleryItemHeight);
      // console.log('showing horiz: ' + showingHorizontally);
      // console.log('showing vert: ' + showingVertically);
      // set the height of gallery to however much it takes to fill the gallery
      this.galleryHeight = Math.ceil(this.currResults.total / showingHorizontally) * galleryItemHeight;
      // figure out what % of the way there, and show that many
      this.numberToShow = Math.ceil((scrollTop + clientHeight) / this.galleryHeight * this.currResults.total) + showingHorizontally;

      // Try to animate each element rather than all at once
      // SLOWS THINGS DOWN
      // const finalNumber = Math.ceil((scrollTop + clientHeight) / this.galleryHeight * this.currResults.total) + showingHorizontally;
      // this.showRemaining(finalNumber);

    } else if (this.appState.currentView === 'filmstrip') {
      const textPadding = (this.settingsButtons['showMoreInfo'].toggled ? 50 : 30);
      const galleryItemHeight = (this.imgHeight + textPadding);
      this.galleryHeight = Math.ceil(this.currResults.total * galleryItemHeight);
      const showingVertically = Math.ceil(clientHeight / galleryItemHeight);
      // console.log('showing vert: ' + showingVertically);
      // figure out what % of the way there, and show that many
      this.numberToShow = Math.ceil((scrollTop + clientHeight) / this.galleryHeight * this.currResults.total);

    } else if (this.appState.currentView === 'files') {
      // rough estimate
      this.galleryHeight = Math.ceil(this.currResults.total * 20) + 30; // + 30 is fudge factor
      // rough estimate
      const showingVertically = Math.floor(clientHeight / 20);
      // console.log('showing vert: ' + showingVertically);
      this.numberToShow = Math.ceil((scrollTop + clientHeight) / this.galleryHeight * this.currResults.total) + 30; // + 1 is fudge factor
    }

  }

  // SLOWS THINGS DOWN
  // public showRemaining(finalNumber) {
  //   if (finalNumber > this.numberToShow) {

  //     const oldNumber = this.numberToShow;

  //     for (let i = 0; i < (finalNumber - oldNumber); i++) {
  //       setTimeout(() => {
  //         this.numberToShow = oldNumber + i;
  //       }, i * 50);
  //     }

  //   } else {
  //     this.numberToShow = finalNumber;
  //   }

  // }

  // INTERACT WITH ELECTRON

  // Send initial hello message -- used to grab settings
  public justStarted(): void {
    this.electronService.ipcRenderer.send('just-started', 'lol');
  }

  public loadThisJsonFile(fullPath: string): void {
    this.electronService.ipcRenderer.send('load-this-json-file', fullPath);
  }

  public loadFromFile(): void {
    this.electronService.ipcRenderer.send('load-the-file', 'lol');
  }

  public selectSourceDirectory(): void {
    this.electronService.ipcRenderer.send('choose-input', 'lol');
  }

  public selectOutputDirectory(): void {
    this.electronService.ipcRenderer.send('choose-output', 'lol');
  }

  public importFresh(): void {
    this.electronService.ipcRenderer.send('start-the-import', this.screenshotSizeForImport);
  }

  public initiateMinimize(): void {
    this.electronService.ipcRenderer.send('minimize-window', 'lol');
  }

  public initiateMaximize(): void {
    if (this.appMaximized === false) {
      this.electronService.ipcRenderer.send('maximize-window', 'lol');
      this.appMaximized = true;
    } else {
      this.electronService.ipcRenderer.send('un-maximize-window', 'lol');
      this.appMaximized = false;
    }
  }

  public initiateClose(): void {
    this.appState.imgHeight = this.imgHeight || 100;
    this.electronService.ipcRenderer.send('close-window', this.getSettingsForSave());
  }

  public openVideo(number): void {
    this.currentPlayingFolder = this.finalArray[number][0];
    this.currentPlayingFile = this.finalArray[number][2];
    const fullPath = this.appState.selectedSourceFolder + this.finalArray[number][0] + '/' + this.finalArray[number][1];
    this.electronService.ipcRenderer.send('openThisFile', fullPath);
  }

  // -----------------------------------------------------------------------------------------------
  // handle output from top.component

  /**
   * Add filter to FILE search when word in file is clicked
   * @param filter
   */
  handleFileWordClicked(filter: string): void {
    this.onEnterKey(filter, 3); // 3rd item is the `file` filter
  }

  /**
   * Add filter to FOLDER search when word in folder is clicked
   * @param filter
   */
  handleFolderWordClicked(filter: string): void {
    this.onEnterKey(filter, 1); // 1st item is the `folder` filter
  }

  // -----------------------------------------------------------------------------------------------
  // Interaction functions

  /**
   * Show or hide settings
   */
  toggleSettings(): void {
    this.buttonsInView = !this.buttonsInView;
  }

  /**
   * Perform appropriate action when a button is clicked
   * @param   uniqueKey   the uniqueKey string of the button
   */
  toggleButton(uniqueKey: string): void {
    if (uniqueKey === 'showThumbnails') {
      this.settingsButtons['showThumbnails'].toggled = true;
      this.settingsButtons['showFilmstrip'].toggled = false;
      this.settingsButtons['showFiles'].toggled = false;
      this.appState.currentView = 'thumbs';
      if (this.numberToShow > 40) {
        this.numberToShow = 40;
      }
      this.debounceUpdateMax(0);
    } else if (uniqueKey === 'showFilmstrip') {
      this.settingsButtons['showThumbnails'].toggled = false;
      this.settingsButtons['showFilmstrip'].toggled = true;
      this.settingsButtons['showFiles'].toggled = false;
      this.appState.currentView = 'filmstrip';
      if (this.numberToShow > 20) {
        this.numberToShow = 20;
      }
      this.debounceUpdateMax(0);
    } else if (uniqueKey === 'showFiles') {
      this.settingsButtons['showThumbnails'].toggled = false;
      this.settingsButtons['showFilmstrip'].toggled = false;
      this.settingsButtons['showFiles'].toggled = true;
      this.appState.currentView = 'files';
      if (this.numberToShow < 80) {
        this.numberToShow = 80;
      }
      this.debounceUpdateMax(0);
    } else if (uniqueKey === 'makeSmaller') {
      this.decreaseSize();
      this.debounceUpdateMax();
    } else if (uniqueKey === 'makeLarger') {
      this.increaseSize();
      this.debounceUpdateMax();
    } else if (uniqueKey === 'startWizard') {
      this.startWizard();
    } else if (uniqueKey === 'rescanDirectory') {
      this.rescanDirectory();
    } else {
      this.settingsButtons[uniqueKey].toggled = !this.settingsButtons[uniqueKey].toggled;
    }
  }

  /**
   * Start the wizard again
   */
  public startWizard(): void {
    this.toggleSettings();
    this.appState.selectedSourceFolder = '';
    this.appState.selectedOutputFolder = '';
    this.inProgress = false;
    this.showWizard = true;
    this.importDone = false;
    this.totalNumberOfFiles = -1;
  }

  /**
   * Rescan the current input directory
   */
  public rescanDirectory(): void {
    const sourceAndOutput: any = {};
    sourceAndOutput.inputFolder = this.appState.selectedSourceFolder;
    sourceAndOutput.outputFolder = this.appState.selectedOutputFolder;
    this.progressNum1 = 0;
    this.toggleSettings();
    this.importDone = false;
    this.electronService.ipcRenderer.send('rescan-current-directory', sourceAndOutput);
  }

  /**
   * Decrease preview size
   */
  public decreaseSize(): void {
    if (this.imgHeight > 50) {
      this.imgHeight = this.imgHeight - 25;
    }
  }

  /**
   * Increase preview size
   */
  public increaseSize(): void {
    if (this.imgHeight < 300) {
      this.imgHeight = this.imgHeight + 25;
    }
  }

  /**
   * Add search string to filter array
   * When user presses the `ENTER` key
   * @param value  -- the string to filter
   * @param origin -- can be `file`, `fileUnion`, `folder`, `folderUnion` -- KEYS for the `filters` Array
   */
  onEnterKey(value: string, origin: number): void {
    const trimmed = value.trim();
    if (trimmed) {
      this.filters[origin].array.push(trimmed);
      this.filters[origin].bool = !this.filters[origin].bool;
      this.filters[origin].string = '';
    }
  }

  /**
   * Removes last-added filter
   * When user presses the `BACKSPACE` key
   * @param origin  -- array from which to .pop()
   */
  onBackspace(value: string, origin: number): void {
    if (value === '' && this.filters[origin].array.length > 0) {
      this.filters[origin].array.pop();
      this.filters[origin].bool = !this.filters[origin].bool;
    }
  }

  /**
   * Removes item from particular search array
   * When user clicks on a particular search word
   * @param item    {number}  index within array of search strings
   * @param origin  {number}  index within filters array
   */
  removeThisFilter(item: number, origin: number): void {
    this.filters[origin].array.splice(item, 1);
    this.filters[origin].bool = !this.filters[origin].bool;
  }

  /**
   * Toggle the visibility of the settings button
   * @param item  -- index within the searchButtons array to toggle
   */
  toggleHideButton(item: string): void {
    this.settingsButtons[item].hidden = !this.settingsButtons[item].hidden;
  }

  /**
   * Show or hide the settings menu
   */
  toggleSettingsMenu(): void {
    this.appState.menuHidden = !this.appState.menuHidden;
  }

  /**
   * Called on screenshot size dropdown select
   */
  selectScreenshotSize(pxHeightForImport: number) {
    // TODO better prediction
    this.totalImportSize = Math.round((pxHeightForImport / 100) * this.totalNumberOfFiles * 36 / 1000);
    this.screenshotSizeForImport = pxHeightForImport;
  }

  // ---- HANDLE EXTRACTING AND RESTORING SETTINGS ON OPEN AND BEFORE CLOSE ------

  /**
   * Prepare and return the settings object for saving
   * happens right before closing the app !!!
   */
  getSettingsForSave(): any {

    const buttonSettings = {};

    this.grabAllSettingsKeys().forEach(element => {
      buttonSettings[element] = {};
      buttonSettings[element].toggled = this.settingsButtons[element].toggled;
      buttonSettings[element].hidden = this.settingsButtons[element].hidden;
    });

    // console.log(buttonSettings);
    return {
      buttonSettings: buttonSettings,
      appState: this.appState
    };
  }

  /**
   * Return all keys from the settings-buttons
   */
  grabAllSettingsKeys(): string[] {
    const objectKeys: string[] = [];

    this.settingsButtonsGroups.forEach(element => {
      element.forEach(key => {
        objectKeys.push(key);
      })
    });

    // console.log(objectKeys);
    return(objectKeys);
  }

  /**
   * restore settings from saved file
   */
  restoreSettingsFromBefore(settingsObject): void {
    if (settingsObject.appState) {
      this.appState = settingsObject.appState;
    }
    this.imgHeight = this.appState.imgHeight;
    this.grabAllSettingsKeys().forEach(element => {
      if (settingsObject.buttonSettings[element]) {
        this.settingsButtons[element].toggled = settingsObject.buttonSettings[element].toggled;
        this.settingsButtons[element].hidden = settingsObject.buttonSettings[element].hidden;
      }
    });
  }

}
