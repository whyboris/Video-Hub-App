import { Component, ChangeDetectorRef, OnInit, HostListener, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

import { setTimeout } from 'timers';

import { VirtualScrollComponent } from 'angular2-virtual-scroll';

import { ElectronService } from 'app/providers/electron.service';
import { ShowLimitService } from 'app/components/pipes/show-limit.service';
import { ResolutionFilterService } from 'app/components/pipes/resolution-filter.service';
import { WordFrequencyService } from 'app/components/pipes/word-frequency.service';

import { FinalObject } from '../common/final-object.interface';
import { SettingsObject } from '../common/settings-object.interface';
import { HistoryItem } from '../common/history-item.interface';

import { AppState } from '../common/app-state';
import { Filters } from '../common/filters';
import { SettingsButtons, SettingsButtonsGroups, SettingsCategories } from '../common/settings-buttons';
import { WizardOptions } from '../common/wizard-options.interface';

import {
  donutAppear,
  galleryItemAppear,
  historyItemRemove,
  modalAnimation,
  myWizardAnimation,
  slowFadeIn,
  slowFadeOut,
  topAnimation
} from '../common/animations';

import { DemoContent } from '../../../assets/demo-content';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: [
    './layout.scss',
    './top-buttons.scss',
    './settings.scss',
    './buttons.scss',
    './search.scss',
    './fonts/icons.scss',
    './gallery.scss',
    './wizard.scss',
    './resolution.scss'
  ],
  animations: [
    donutAppear,
    galleryItemAppear,
    historyItemRemove,
    modalAnimation,
    myWizardAnimation,
    slowFadeIn,
    slowFadeOut,
    topAnimation
  ]
})
export class HomeComponent implements OnInit, AfterViewInit {

  @ViewChild(VirtualScrollComponent)
  virtualScroll: VirtualScrollComponent;

  @ViewChild('searchRef') searchRef: ElementRef;

  @ViewChild('magicSearch') magicSearch: ElementRef;

  settingsButtons = SettingsButtons;
  defaultSettingsButtons = {};
  settingsButtonsGroups = SettingsButtonsGroups;
  settingsCategories = SettingsCategories;

  filters = Filters;

  // App state to save -- so it can be exported and saved when closing the app
  appState = AppState;

  // DEMO MODE TOGGLE !!!
  demo = false;
  webDemo = false;
  versionNumber = '0.9.9';
  macVersion = false;

  // REORGANIZE / keep
  currentPlayingFile = '';
  currentPlayingFolder = '';
  magicSearchString = '';

  showWizard = false; // set to true if `noSettingsPresent` message comes

  importDone = false;
  inProgress = false;
  progressPercent = 0;
  canCloseWizard = false;

  appMaximized = false;

  imgHeight = 100;

  progressNum1 = 0;
  progressNum2 = 100;

  screenshotSizeForImport = 100;

  myTimeout = null;

  buttonsInView = false;

  // temp
  wordFreqArr: any;
  currResults: any = { showing: 0, total: 0 };

  // stuff to do with frequency
  resolutionFreqArr: number[];
  freqLeftBound: number = 0;
  freqRightBound: number = 4;
  resolutionNames: string[] = ['SD','720','1080','4K'];

  fileMap: any; // should be a map from number (imageId) to number (element in finalArray);

  // for text padding below filmstrip or thumbnail element
  textPaddingHeight: number;
  previewWidth: number;

  public finalArray = [];

  vhaFileHistory: HistoryItem[] = [];

  fullPathToCurrentFile = '';

  shuffleTheViewNow = 0; // dummy number to force re-shuffle current view

  allScreenShotsExtracted = true;

  futureHubName = '';
  hubNameToRemember = '';
  importStage = 0;

  // temp variables for the wizard during import
  wizard: WizardOptions = {
    totalNumberOfFiles: -1,
    totalImportTime: 0,
    totalImportSize: 0,
    selectedSourceFolder: '',
    selectedOutputFolder: ''
  };

  extractionPercent = 1;

  flickerReduceOverlay = true;

  progressString = '';

  // Listen for key presses
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // .metaKey is for mac `command` button
    if (event.ctrlKey === true || event.metaKey) {
      if (event.key === 's') {
        this.shuffleTheViewNow++;
      } else if (event.key === 'o') {
        if (this.showWizard === false) {
          this.toggleSettings();
        }
      } else if (event.key === 'f') {
        if (this.settingsButtons['file'].toggled === false) {
          this.settingsButtons['file'].toggled = true;
        }
        this.showSidebar();
        setTimeout(() => {
          if (this.searchRef.nativeElement.children.file) {
            // focus on the search !!!
            this.searchRef.nativeElement.children.file.focus();
          }
        }, 1);
      } else if (event.key === 'n') {
        this.startWizard();
        this.buttonsInView = false;
      } else if (event.key === 'd') {
        this.toggleButton('darkMode');
      } else if (event.key === 'z') {
        this.toggleButton('makeSmaller');
      } else if (event.key === 'x') {
        this.toggleButton('makeLarger');
      } else if (event.key === 't') {
        this.toggleButton('showMoreInfo');
      } else if (event.key === '1') {
        this.toggleButton('showThumbnails');
      } else if (event.key === '2') {
        this.toggleButton('showFilmstrip');
      } else if (event.key === '3') {
        this.toggleButton('showFiles');
      } else if (event.key === 'h') {
        this.toggleButton('hideTop');
        this.toggleButton('hideSidebar');
        this.toggleSettingsMenu();
        this.toggleButton('showMoreInfo');
      } else if (event.key === 'a') {
        this.toggleButton('hideSidebar');
      } else if (event.key === 'q') {
        if (!this.settingsButtons['magic'].toggled) {
          this.settingsButtons['magic'].toggled = true;
        }
        this.showSidebar();
        setTimeout(() => {
          this.magicSearch.nativeElement.focus();
        }, 1);
      }
    } else if (event.key === 'Escape' && this.showWizard === true && this.canCloseWizard === true) {
      this.showWizard = false;
    } else if (event.key === 'Escape' && this.buttonsInView) {
      this.buttonsInView = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  handleResizeEvent(event: any) {
    this.debounceUpdateMax();
  }

  constructor(
    public cd: ChangeDetectorRef,
    public showLimitService: ShowLimitService,
    public wordFrequencyService: WordFrequencyService,
    public resolutionFilterService: ResolutionFilterService,
    public electronService: ElectronService
  ) { }

  ngOnInit() {
  
    // To test the progress bar
    // setInterval(() => {
    //   this.importStage = this.importStage === 2 ? 1 : 2;
    // }, 3000);

    // To test the progress bar
    // setInterval(() => {
    //   this.extractionPercent = this.extractionPercent + 8;
    //   if (this.extractionPercent > 99) {
    //     this.extractionPercent = 1;
    //   }
    // }, 2000);

    this.cloneDefaultButtonSetting();

    setTimeout(() => {
      this.wordFrequencyService.finalMapBehaviorSubject.subscribe((value) => {
        this.wordFreqArr = value;
        // this.cd.detectChanges();
      });
      this.resolutionFilterService.finalResolutionMapBehaviorSubject.subscribe((value) => {
        this.resolutionFreqArr = value;
        // this.cd.detectChanges();
      });
      this.showLimitService.searchResults.subscribe((value) => {
        this.currResults = value;
        this.cd.detectChanges();
        this.debounceUpdateMax(10);
      });

      if (this.webDemo) {
        const finalObject = DemoContent;
        // TODO -- MAYBE ???? UPDATE SINCE THE BELOW HAS BEEN UPDATED
        // identical to `finalObjectReturning`
        this.appState.numOfFolders = finalObject.numOfFolders;
        // DEMO CONTENT -- CONFIRM THAT IT WORKS !!!
        this.appState.selectedOutputFolder = 'images';
        this.appState.selectedSourceFolder = finalObject.inputDir;
        this.inProgress = false;
        this.importDone = true;
        this.canCloseWizard = true;
        this.showWizard = false;
        this.finalArray = finalObject.images;
        this.buildFileMap();
        setTimeout(() => {
          this.toggleButton('showThumbnails');
        }, 1000);
      }

    }, 100);

    // Returning Input
    this.electronService.ipcRenderer.on('inputFolderChosen', (event, filePath, totalFilesInDir) => {
      this.wizard.totalNumberOfFiles = totalFilesInDir;
      // TODO better prediction

      if (totalFilesInDir > 0) {
        this.wizard.totalImportTime = Math.round(totalFilesInDir * 2.25 / 60);
        this.wizard.selectedSourceFolder = filePath;
        this.wizard.selectedOutputFolder = filePath;
      }
    });

    // Returning Output
    this.electronService.ipcRenderer.on('outputFolderChosen', (event, filePath) => {
      this.wizard.selectedOutputFolder = filePath;
    });

    // Happens if a file with the same hub name already exists in the directory
    this.electronService.ipcRenderer.on('pleaseFixHubName', (event) => {
      this.inProgress = false;
    });

    // Progress bar messages
    // for META EXTRACTION
    this.electronService.ipcRenderer.on('processingProgress', (event, a: number, b: number, stage: number) => {
      this.importStage = stage;
      this.progressNum1 = a;
      this.progressNum2 = b;
      this.progressPercent = a / b;
      this.progressString = 'loading - ' + Math.round(a * 100 / b) + '%';
      if (this.importStage === 2) {
        this.extractionPercent = Math.round(100 * a / b);
      }
      if (a === b) {
        this.extractionPercent = 1;
        this.importStage = 0;
        this.appState.hubName = this.hubNameToRemember;
        this.allScreenShotsExtracted = true;
      }
    });

    this.electronService.ipcRenderer.on('importInterrupted', (event) => {
      console.log('YOU HAVE STOPPED THE IMPORT PROGRESS !!!!');
    });

    // Final object returns
    this.electronService.ipcRenderer.on('finalObjectReturning',
        (event, finalObject: FinalObject, pathToFile: string, fileName: string) => {
      this.appState.currentVhaFile = pathToFile;
      this.hubNameToRemember = finalObject.hubName;
      this.appState.hubName = finalObject.hubName;
      this.appState.numOfFolders = finalObject.numOfFolders;
      this.appState.selectedOutputFolder = pathToFile.replace(fileName + '.vha', '');
      this.appState.selectedSourceFolder = finalObject.inputDir;

      // Update history of opened files
      this.updateVhaFileHistory(pathToFile, finalObject.inputDir, finalObject.hubName);

      this.inProgress = false;
      this.importDone = true;
      this.canCloseWizard = true;
      this.showWizard = false;
      this.finalArray = this.demo ? finalObject.images.slice(0, 50) : finalObject.images;
      this.buildFileMap();
      this.flickerReduceOverlay = false;
    });

    // Returning settings
    this.electronService.ipcRenderer.on('settingsReturning', (event, settingsObject: SettingsObject, userWantedToOpen) => {
      this.vhaFileHistory = (settingsObject.vhaFileHistory || []);
      this.restoreSettingsFromBefore(settingsObject);
      if (userWantedToOpen) {
        this.loadThisVhaFile(userWantedToOpen);
      } else if (settingsObject.appState.currentVhaFile) {
        this.loadThisVhaFile(settingsObject.appState.currentVhaFile);
      } else {
        this.showWizard = true;
        this.flickerReduceOverlay = false;
      }
    });

    this.electronService.ipcRenderer.on('pleaseOpenWizard', (event) => {
      // Correlated with the first time ever starting the app !!!
      // Can happen when no settings present
      // Can happen when trying to open a .vha file that no longer exists
      this.showWizard = true;
      this.flickerReduceOverlay = false;
    });

    this.justStarted();
  }

  ngAfterViewInit() {
    // this is required, otherwise when user drops the file, it opens as plaintext
    document.ondragover = document.ondrop = (ev) => {
      ev.preventDefault()
    }
    document.body.ondrop = (ev) => {
      if (ev.dataTransfer.files.length > 0) {
        const fullPath = ev.dataTransfer.files[0].path;
        ev.preventDefault();
        if (fullPath.slice(-4) === '.vha') {
          this.electronService.ipcRenderer.send('load-this-vha-file', ev.dataTransfer.files[0].path);
        }
      }
    }
  }

  /**
   * Low-tech debounced scroll handler
   */
  public debounceUpdateMax(msDelay?: number): void {
    // console.log('debouncing');
    const delay = msDelay !== undefined ? msDelay : 250;
    clearTimeout(this.myTimeout);
    this.myTimeout = setTimeout(() => {
      // console.log('Virtual scroll refreshed');
      this.virtualScroll.refresh()
    }, delay);
  }

  /**
   * Only allow characters and numbers for hub name
   * @param event key press event
   */
  public validateHubName(event: any) {
    const keyCode = event.charCode;
    if (keyCode === 32) {
      return true;
    } else if (48 <= keyCode && keyCode <= 57) {
      return true;
    } else if (65 <= keyCode && keyCode <= 90) {
      return true;
    } else if (97 <= keyCode && keyCode <= 122) {
      return true;
    }
    return false;
  }

  // ---------------- INTERACT WITH ELECTRON ------------------ //

  /**
   * Send initial `hello` message
   * triggers function that grabs settings and sends them back with `settingsReturning`
   */
  public justStarted(): void {
    this.electronService.ipcRenderer.send('just-started', 'lol');
  }

  public loadThisVhaFile(fullPath: string): void {
    this.electronService.ipcRenderer.send('load-this-vha-file', fullPath);
  }

  public loadFromFile(): void {
    this.electronService.ipcRenderer.send('system-open-file-through-modal', 'lol');
  }

  public selectSourceDirectory(): void {
    this.electronService.ipcRenderer.send('choose-input', 'lol');
  }

  public selectOutputDirectory(): void {
    this.electronService.ipcRenderer.send('choose-output', 'lol');
  }

  public importFresh(): void {
    this.appState.selectedSourceFolder = this.wizard.selectedSourceFolder;
    this.appState.selectedOutputFolder = this.wizard.selectedOutputFolder;
    this.wizard.totalNumberOfFiles = -1;
    this.allScreenShotsExtracted = false;
    this.importDone = false;
    this.inProgress = true;
    const importOptions = {
      imgHeight: this.screenshotSizeForImport,
      hubName: (this.futureHubName || 'untitled')
    }
    this.electronService.ipcRenderer.send('start-the-import', importOptions);
  }

  public cancelCurrentImport(): void {
    this.electronService.ipcRenderer.send('cancel-current-import');
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
    this.fullPathToCurrentFile = fullPath;
  }

  public openOnlineHelp(): void {
    this.electronService.ipcRenderer.send('pleaseOpenUrl', 'http://www.videohubapp.com');
  }

  // -----------------------------------------------------------------------------------------------
  // handle output from top.component

  /**
   * Add filter to FILE search when word in file is clicked
   * @param filter
   */
  handleFileWordClicked(filter: string): void {
    this.showSidebar();
    if (!this.settingsButtons['file'].toggled) {
      this.settingsButtons['file'].toggled = true;
    }
    this.onEnterKey(filter, 3); // 3rd item is the `file` filter
  }

  /**
   * Add filter to FOLDER search when word in folder is clicked
   * @param filter
   */
  handleFolderWordClicked(filter: string): void {
    this.showSidebar();
    if (!this.settingsButtons['folder'].toggled) {
      this.settingsButtons['folder'].toggled = true;
    }
    this.onEnterKey(filter, 1); // 1st item is the `folder` filter
  }

  openInExplorer(): void {
    console.log('should open explorer');
    this.electronService.ipcRenderer.send('openInExplorer', this.fullPathToCurrentFile);
  }

  /**
   * Show sidebar if it's closed
   */
  showSidebar(): void {
    if (this.settingsButtons['hideSidebar'].toggled) {
      this.toggleButton('hideSidebar');
    }
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
   * Add this file to the recently opened list
   * @param file full path to file name
   */
  updateVhaFileHistory(pathToVhaFile: string, pathToVideos: string, hubName: string): void {

    const newHistoryItem = {
      vhaFilePath: pathToVhaFile,
      videoFolderPath: pathToVideos,
      hubName: (hubName || 'untitled')
    }

    let matchFound = false;

    this.vhaFileHistory.forEach((element: any, index: number) => {
      if (element.vhaFilePath === pathToVhaFile) {
        matchFound = true;
        // remove from current position
        this.vhaFileHistory.splice(index, 1);
        this.vhaFileHistory.splice(0, 0, newHistoryItem);
      }
    });

    if (!matchFound) {
      // TODO -- use slice -- this is reall really dumb!
      this.vhaFileHistory.reverse();
      this.vhaFileHistory.push(newHistoryItem);
      this.vhaFileHistory.reverse();
    }

    // console.log('CURRENT HISTORY OF VHA FILES');
    // console.log(this.vhaFileHistory);
  }

  /**
   * Handle click from html to open a recently-opened VHA file
   * @param index - index of the file from `vhaFileHistory`
   */
  openFromHistory(index: number): void {
    // console.log('trying to open ' + index);
    // console.log(this.vhaFileHistory[index]);
    this.loadThisVhaFile(this.vhaFileHistory[index].vhaFilePath);
  }

  /**
   * Handle click from html to open a recently-opened VHA file
   * @param index - index of the file from `vhaFileHistory`
   */
  removeFromHistory(event: Event, index: number): void {
    event.stopPropagation();
    // console.log('trying to remove ' + index);
    // console.log(this.vhaFileHistory[index]);
    this.vhaFileHistory.splice(index, 1);
  }

  /**
   * Clear out the recently-viewed history
   */
  clearRecentlyViewedHistory(): void {
    this.vhaFileHistory = [];
  }

  /**
   * Show or hide settings
   */
  toggleSettings(): void {
    this.buttonsInView = !this.buttonsInView;
  }

  hideWizard(): void {
    this.showWizard = false;
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
    } else if (uniqueKey === 'clearHistory') {
      this.clearRecentlyViewedHistory();
    } else if (uniqueKey === 'resetSettings') {
      this.resetSettingsToDefault();
    } else if (uniqueKey === 'rescanDirectory') {
      this.rescanDirectory();
    } else if (uniqueKey === 'shuffleGalleryNow') {
      this.shuffleTheViewNow++;
    } else if (uniqueKey === 'randomizeGallery') {
      if (this.settingsButtons['randomizeGallery'].toggled === true) {
        this.shuffleTheViewNow = 0;
      }
      this.settingsButtons['randomizeGallery'].toggled = !this.settingsButtons['randomizeGallery'].toggled;
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
   * Complex logic to see if we should shuffle things!
   */
  public shouldWeShuffle(): void {
    if (this.settingsButtons['randomizeGallery'].toggled === true) {
      this.shuffleTheViewNow++;
    } else {
      this.shuffleTheViewNow = 0;
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
    this.futureHubName = '';
    this.wizard = {
      totalNumberOfFiles: -1,
      totalImportTime: 0,
      totalImportSize: 0,
      selectedSourceFolder: '',
      selectedOutputFolder: ''
    };
    this.toggleSettings();
    this.showWizard = true;
  }

  /**
   * Rescan the current input directory
   */
  public rescanDirectory(): void {
    const sourceAndVhaFile: any = {};
    sourceAndVhaFile.inputFolder = this.appState.selectedSourceFolder;
    sourceAndVhaFile.pathToVhaFile = this.appState.currentVhaFile;
    this.progressNum1 = 0;
    this.toggleSettings();
    this.importDone = false;
    console.log('rescanning');
    console.log(sourceAndVhaFile);
    this.electronService.ipcRenderer.send('rescan-current-directory', sourceAndVhaFile);
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
    // console.log('textPaddingHeight = ' + this.textPaddingHeight);
  }

  magicSearchChanged(event): void {
    this.shouldWeShuffle();
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
    this.shouldWeShuffle();
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
    this.shouldWeShuffle();
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
    this.shouldWeShuffle();
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
    this.wizard.totalImportSize = Math.round((pxHeightForImport / 100) * this.wizard.totalNumberOfFiles * 36 / 1000);
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
      appState: this.appState,
      vhaFileHistory: this.vhaFileHistory
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
   * Restore settings to their default values
   */
  resetSettingsToDefault(): void {
    this.settingsButtons = JSON.parse(JSON.stringify(this.defaultSettingsButtons));
  }

  /**
   * Clone default settings in case user wants to reset them later
   */
  cloneDefaultButtonSetting(): void {
    this.defaultSettingsButtons = JSON.parse(JSON.stringify(this.settingsButtons));
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

  /**
   * Update the min and max resolution for the resolution filter
   * @param selection 
   */
  newResFilterSelected(selection: number[]): void {
    this.freqLeftBound = selection[0];
    this.freqRightBound = selection[1];
    // console.log(selection);
  }

}
