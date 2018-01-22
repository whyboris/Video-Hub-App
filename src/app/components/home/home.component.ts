import { Component, ChangeDetectorRef, OnInit, HostListener, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

import { setTimeout } from 'timers';

import { VirtualScrollComponent } from 'angular2-virtual-scroll';

import { ElectronService } from '../../providers/electron.service';
import { ShowLimitService } from 'app/components/pipes/show-limit.service';
import { WordFrequencyService } from 'app/components/pipes/word-frequency.service';

import { FinalObject } from '../common/final-object.interface';

import { AppState } from '../common/app-state';
import { Filters } from '../common/filters';
import { SettingsButtons, SettingsButtonsGroups, SettingsCategories } from 'app/components/common/settings-buttons';

import { myAnimation, myAnimation2, myWizardAnimation, galleryItemAppear, topAnimation } from '../common/animations';

import { DemoContent } from '../../../assets/demo-content';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: [
    './layout.scss',
    './settings.scss',
    './buttons.scss',
    './search.scss',
    './photon/icons.scss',
    './gallery.scss',
    './wizard.scss'
  ],
  animations: [
    myAnimation,
    myAnimation2,
    myWizardAnimation,
    topAnimation
  ]
})
export class HomeComponent implements OnInit, AfterViewInit {

  @ViewChild(VirtualScrollComponent)
  virtualScroll: VirtualScrollComponent;

  settingsButtons = SettingsButtons;
  settingsButtonsGroups = SettingsButtonsGroups;
  settingsCategories = SettingsCategories;

  filters = Filters;

  // App state to save -- so it can be exported and saved when closing the app
  appState = AppState;

  // DEMO MODE TOGGLE !!!
  demo = false;
  webDemo = false;

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

  myTimeout = null;

  buttonsInView = false;

  // temp variables for the wizard during import
  totalNumberOfFiles = -1;
  totalImportTime = 0;
  totalImportSize = 0;

  // temp
  wordFreqArr: any;
  currResults: any = { showing: 0, total: 0 };

  fileMap: any; // should be a map from number (imageId) to number (element in finalArray);

  // for text padding below filmstrip or thumbnail element
  textPaddingHeight: number;
  previewWidth: number;

  public finalArray = [];

  // temporary
  tempWorks = '-- WIP';

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

      if (this.webDemo) {
        const finalObject = DemoContent;
        // identical to `finalObjectReturning`
        this.appState.numOfFolders = finalObject.numOfFolders;
        this.appState.selectedOutputFolder = finalObject.outputDir;
        this.appState.selectedSourceFolder = finalObject.inputDir;
        this.inProgress = false;
        this.importDone = true;
        this.showWizard = false;
        this.finalArray = finalObject.images;
        this.buildFileMap();
        setTimeout(() => {
          this.toggleButton('showThumbnails');
        }, 1000);
      }

    }, 100);

    // App opened by clicking a particular file !!!
    // UNSURE IF WORKS
    // TODO - clean if doesn't work
    this.electronService.ipcRenderer.on('fileOpenWorks', (event, filePath) => {
      this.tempWorks = filePath;
    });

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
      this.finalArray = this.demo ? finalObject.images.slice(0, 50) : finalObject.images;
      this.buildFileMap();
    });

    // Returning settings
    this.electronService.ipcRenderer.on('settingsReturning', (event, settingsObject: any) => {
      this.restoreSettingsFromBefore(settingsObject);
      if (settingsObject.appState.selectedOutputFolder && settingsObject.appState.selectedSourceFolder) {
        this.loadThisJsonFile(settingsObject.appState.selectedOutputFolder + '/images.vha');
      }
    });

    this.justStarted();
  }

  ngAfterViewInit() {
    // this is required, otherwise when user drops the file, it opens as plaintext
    document.ondragover = document.ondrop = (ev) => {
      ev.preventDefault()
    }
    document.body.ondrop = (ev) => {
      const fullPath = ev.dataTransfer.files[0].path;
      ev.preventDefault();
      if (fullPath.slice(-4) === '.vha') {
        this.electronService.ipcRenderer.send('load-this-json-file', ev.dataTransfer.files[0].path);
      }
    }
  }

  /**
   * Low-tech debounced scroll handler
   */
  public debounceUpdateMax(msDelay?: number): void {
    console.log('debouncing');
    const delay = msDelay !== undefined ? msDelay : 250;
    clearTimeout(this.myTimeout);
    this.myTimeout = setTimeout(() => {
      console.log('Virtual scroll refreshed');
      this.virtualScroll.refresh()
    }, delay);
  }

  /**
   * Handle the `drop` event
   */
  public itemDropped(event: Event) {
    console.log('lololol');
  }

  // ---------------- INTERACT WITH ELECTRON ------------------ //

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

  public openVideo(imageId): void {
    const number = this.fileMap.get(imageId);
    this.currentPlayingFolder = this.finalArray[number][0];
    this.currentPlayingFile = this.finalArray[number][2];
    const fullPath = this.appState.selectedSourceFolder + this.finalArray[number][0] + '/' + this.finalArray[number][1];
    this.electronService.ipcRenderer.send('openThisFile', fullPath);
    console.log(fullPath);
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
   * Create a map
   * from the imageId (3rd element in each item of finalArray)
   * to the item location (in finalArray)
   * They are identical the first time, but will diverge as user rescans video directory
   */
  buildFileMap(): void {
    this.fileMap = new Map;
    this.finalArray.forEach((element, index) => {
      this.fileMap.set(element[3], index);
    });
    // console.log(this.fileMap);
  }

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
      this.computeTextBufferAmount();
      this.scrollToTop();
    } else if (uniqueKey === 'showFilmstrip') {
      this.settingsButtons['showThumbnails'].toggled = false;
      this.settingsButtons['showFilmstrip'].toggled = true;
      this.settingsButtons['showFiles'].toggled = false;
      this.appState.currentView = 'filmstrip';
      this.computeTextBufferAmount();
      this.scrollToTop();
    } else if (uniqueKey === 'showFiles') {
      this.settingsButtons['showThumbnails'].toggled = false;
      this.settingsButtons['showFilmstrip'].toggled = false;
      this.settingsButtons['showFiles'].toggled = true;
      this.appState.currentView = 'files';
      this.computeTextBufferAmount();
      this.scrollToTop();
    } else if (uniqueKey === 'makeSmaller') {
      this.decreaseSize();
    } else if (uniqueKey === 'makeLarger') {
      this.increaseSize();
    } else if (uniqueKey === 'startWizard') {
      this.startWizard();
    } else if (uniqueKey === 'rescanDirectory') {
      this.rescanDirectory();
    } else {
      this.settingsButtons[uniqueKey].toggled = !this.settingsButtons[uniqueKey].toggled;
      if (uniqueKey === 'showMoreInfo') {
        this.computeTextBufferAmount();
      }
      if (uniqueKey === 'hideSidebar') {
        setTimeout(() => {
          this.virtualScroll.refresh();
        }, 300);
      }
    }
  }

  /**
   * scroll to the top of the gallery
   */
  public scrollToTop(): void {
    document.getElementById('scrollDiv').scrollTop = 0;
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
    this.computePreviewWidth();
  }

  /**
   * Increase preview size
   */
  public increaseSize(): void {
    if (this.imgHeight < 300) {
      this.imgHeight = this.imgHeight + 25;
    }
    this.computePreviewWidth();
  }

  /**
   * Computes the preview width for thumbnails view
   */
  public computePreviewWidth(): void {
    this.previewWidth = Math.ceil((this.imgHeight / 100) * 174);
  }

  /**
   * Compute the number of pixels needed to add to the preview item
   * Thumbnails need more space for the text
   * Filmstrip needs less
   */
  public computeTextBufferAmount(): void {
    this.computePreviewWidth();
    if (this.appState.currentView === 'thumbs') {
      if (this.settingsButtons.showMoreInfo.toggled) {
        this.textPaddingHeight = 55;
      } else {
        this.textPaddingHeight = 20;
      }
    } else if (this.appState.currentView === 'filmstrip') {
      if (this.settingsButtons.showMoreInfo.toggled) {
        this.textPaddingHeight = 20;
      } else {
        this.textPaddingHeight = 0;
      }
    } else if (this.appState.currentView === 'files') {
      this.textPaddingHeight = 20;
    }
    console.log('textPaddingHeight = ' + this.textPaddingHeight);
  }

  /**
   * Add search string to filter array
   * When user presses the `ENTER` key
   * @param value  -- the string to filter
   * @param origin -- number in filter array of the filter to target
   */
  onEnterKey(value: string, origin: number): void {
    let trimmed = value.trim();
    // removes '/' from folder path if there
    // happens when user clicks folder path in file view
    if (trimmed[0] === '/' || trimmed[0] === '\\') {
      trimmed = trimmed.substr(1);
    }
    if (trimmed) {
      // don't include duplicates
      if (!this.filters[origin].array.includes(trimmed)) {
        this.filters[origin].array.push(trimmed);
        this.filters[origin].bool = !this.filters[origin].bool;
        this.filters[origin].string = '';
      }
    }
    this.scrollToTop();
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
    this.computeTextBufferAmount();
  }

}
