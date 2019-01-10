import { Component, ChangeDetectorRef, OnInit, HostListener, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';
import { VirtualScrollerComponent } from 'ngx-virtual-scroller';

import { ElectronService } from '../../providers/electron.service';
import { ResolutionFilterService, ResolutionString } from '../../components/pipes/resolution-filter.service';
import { ShowLimitService } from '../../components/pipes/show-limit.service';
import { TagsSaveService } from './tags/tags-save.service';
import { WordFrequencyService } from '../../components/pipes/word-frequency.service';

import { FinalObject, ImageElement } from '../common/final-object.interface';
import { HistoryItem } from '../common/history-item.interface';
import { ImportSettingsObject } from '../common/import.interface';
import { SavableProperties } from '../common/savable-properties.interface';
import { SettingsObject } from '../common/settings-object.interface';
import { WizardOptions } from '../common/wizard-options.interface';

import { AppState, SupportedLanguage } from '../common/app-state';
import { Filters } from '../common/filters';
import { SettingsButtons, SettingsButtonsGroups, SettingsMetaGroupLabels, SettingsMetaGroup } from '../common/settings-buttons';

import { English } from '../../i18n/en';
import { French } from '../../i18n/fr';
import { Russian } from '../../i18n/ru';

import {
  donutAppear,
  galleryItemAppear,
  historyItemRemove,
  modalAnimation,
  myWizardAnimation,
  overlayAppear,
  rightClickAnimation,
  rightClickContentAnimation,
  slowFadeIn,
  slowFadeOut,
  topAnimation
} from '../common/animations';

// import { DemoContent } from '../../../assets/demo-content';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: [
    './layout.scss',
    './top-buttons.scss',
    './settings.scss',
    './buttons.scss',
    './search.scss',
    './search-input.scss',
    './fonts/icons.scss',
    './gallery.scss',
    './wizard-button.scss',
    './wizard.scss',
    './resolution.scss',
    './rightclick.scss'
  ],
  animations: [
    donutAppear,
    galleryItemAppear,
    historyItemRemove,
    modalAnimation,
    myWizardAnimation,
    overlayAppear,
    rightClickAnimation,
    rightClickContentAnimation,
    slowFadeIn,
    slowFadeOut,
    topAnimation
  ]
})
export class HomeComponent implements OnInit, AfterViewInit {

  @ViewChild('magicSearch') magicSearch: ElementRef;
  @ViewChild('renameFileInput') renameFileInput: ElementRef;
  @ViewChild('searchRef') searchRef: ElementRef;

  // used to grab the `scrollable-content` element - background of gallery for right-click
  galleryBackgroundRef: any;

  @ViewChild(VirtualScrollerComponent)
  virtualScroller: VirtualScrollerComponent;

  defaultSettingsButtons = {};
  settingsButtons = SettingsButtons;
  settingsButtonsGroups = SettingsButtonsGroups;
  settingsMetaGroup = SettingsMetaGroup;
  settingsMetaGroupLabels = SettingsMetaGroupLabels;
  settingToShow = 0;

  filters = Filters;

  // App state to save -- so it can be exported and saved when closing the app
  appState = AppState;

  // ========================================================================================
  // ***************************** BUILD TOGGLE *********************************************
  // ========================================================================================
  demo = false;
  webDemo = false;
  versionNumber = '1.3.0';
  macVersion = false;
  // ========================================================================================

  // REORGANIZE / keep
  currentPlayingFile = '';
  currentPlayingFolder = '';
  magicSearchString = '';

  showWizard = false; // set to true if `noSettingsPresent` message comes

  progressPercent = 0;
  canCloseWizard = false;

  appMaximized = false;

  imgHeight = 100;

  progressNum1 = 0;
  progressNum2 = 100;

  screenshotSizeForImport = 288; // default to 288px

  myTimeout = null;

  buttonsInView = false;

  // temp
  wordFreqArr: any;
  currResults: any = { showing: 0, total: 0 };

  // stuff to do with frequency
  resolutionFreqArr: number[];
  freqLeftBound: number = 0;
  freqRightBound: number = 4;
  resolutionNames: ResolutionString[] = ['SD', '720', '1080', '4K'];

  rightClickShowing: boolean = false;
  itemToRename: any; // strongly type this -- it's an element from finalArray !!!
  renamingWIP: string; // ngModel for renaming file
  renamingExtension: string;

  findMostSimilar: string; // for finding similar files to this one

  showSimilar: boolean = false; // to toggle the similarity pipe

  fileMap: any; // should be a map from number (imageId) to number (element in finalArray);

  // for text padding below filmstrip or thumbnail element
  textPaddingHeight: number;
  previewWidth: number;

  public finalArray: ImageElement[] = [];

  finalArrayNeedsSaving: boolean = false; // if ever a file was renamed, re-save the .vha file

  vhaFileHistory: HistoryItem[] = [];

  fullPathToCurrentFile = '';

  shuffleTheViewNow = 0; // dummy number to force re-shuffle current view

  futureHubName = '';
  hubNameToRemember = '';
  importStage = 0;

  // temp variables for the wizard during import
  wizard: WizardOptions = {
    totalNumberOfFiles: -1,
    listOfFiles: [],
    totalImportTime: 0,
    totalImportSize: 0,
    selectedSourceFolder: '',
    selectedOutputFolder: ''
  };

  extractionPercent = 1;

  flickerReduceOverlay = true;

  progressString = '';

  // RENAMING FUNCTIONALITY

  currentRightClickedItem: any; // element from FinalArray
  renamingNow: boolean = false;

  clickedOnFile: boolean; // whether right-clicked on file or gallery background

  rightClickPosition: any = { x: 0, y: 0 };

  nodeRenamingFile: boolean = false;
  renameErrMsg: string = '';

  // Thumbnail Sheet Display
  sheetDisplay: boolean = false;
  itemToDisplay: ImageElement;

  // WIP

  numOfScreenshots = 10; // hardcoded for now. Only used for import - TODO - refactor?

  isFirstRunEver = false;

  galleryWidth: number;

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
      } else if (event.key === 'q') {
        event.preventDefault();
        event.stopPropagation();
        this.initiateClose();
      } else if (event.key === 'z') {
        this.toggleButton('makeSmaller');
      } else if (event.key === 'x') {
        this.toggleButton('makeLarger');
      } else if (event.key === 't') {
        this.toggleButton('showTags');
      } else if (event.key === '1') {
        this.toggleButton('showThumbnails');
      } else if (event.key === '2') {
        this.toggleButton('showFilmstrip');
      } else if (event.key === '3') {
        this.toggleButton('showFiles');
      } else if (event.key === '4') {
        this.toggleButton('showClips');
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
    } else if (event.key === 'Escape' && (this.rightClickShowing || this.renamingNow || this.sheetDisplay)) {
      this.rightClickShowing = false;
      this.renamingNow = false;
      this.sheetDisplay = false;
    } else if (event.key === 'Escape' && this.settingsButtons['showTags'].toggled) {
      this.toggleButton('showTags');
    }
  }

  @HostListener('window:resize')
  handleResizeEvent() {
    this.debounceUpdateMax();
  }

  @HostListener('window:click')
  handleWindowClick() {
    if (this.rightClickShowing) {
      this.rightClickShowing = false;
    }
  }

  constructor(
    public cd: ChangeDetectorRef,
    public electronService: ElectronService,
    public resolutionFilterService: ResolutionFilterService,
    public showLimitService: ShowLimitService,
    public tagsSaveService: TagsSaveService,
    public translate: TranslateService,
    public wordFrequencyService: WordFrequencyService,
    private elementRef: ElementRef
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang('en');
    this.changeLanguage('en');

    // enable right-clicking of the gallery
    setTimeout(() => {
      // `.scrollable-content` is css on an element generated by Virtual Scroll
      this.galleryBackgroundRef = this.elementRef.nativeElement.querySelector('.scrollable-content');
      this.galleryBackgroundRef.addEventListener('contextmenu', (event) => {
        this.rightMouseClicked(event, null);
      });
    }, 1000);

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

      // if (this.webDemo) {
      //   const finalObject = DemoContent;
      //   // TODO -- MAYBE ???? UPDATE SINCE THE BELOW HAS BEEN UPDATED
      //   // identical to `finalObjectReturning`
      //   this.appState.numOfFolders = finalObject.numOfFolders;
      //   // DEMO CONTENT -- CONFIRM THAT IT WORKS !!!
      //   this.appState.selectedOutputFolder = 'images';
      //   this.appState.selectedSourceFolder = finalObject.inputDir;
      //   this.canCloseWizard = true;
      //   this.showWizard = false;
      //   this.finalArray = finalObject.images;
      //   this.buildFileMap();
      //   setTimeout(() => {
      //     this.toggleButton('showThumbnails');
      //   }, 1000);
      // }

    }, 100);

    // Returning Input
    this.electronService.ipcRenderer.on('inputFolderChosen', (event, filePath, listOfFiles) => {
      this.wizard.totalNumberOfFiles = listOfFiles.length;
      this.wizard.listOfFiles = listOfFiles;
      // TODO better prediction

      if (listOfFiles.length > 0) {
        this.wizard.totalImportTime = Math.round(listOfFiles.length * 2.25 / 60);
        this.wizard.selectedSourceFolder = filePath;
        this.wizard.selectedOutputFolder = filePath;
      }
    });

    // Rename file response
    this.electronService.ipcRenderer.on('renameFileResponse', (event, success: boolean, errMsg?: string) => {
      this.nodeRenamingFile = false;

      if (success) {
        // UPDATE THE FINAL ARRAY !!!
        this.replaceOriginalFileName();
        this.closeRename();
      } else {
        this.renameErrMsg = errMsg;
      }
    });

    // Returning Output
    this.electronService.ipcRenderer.on('outputFolderChosen', (event, filePath) => {
      this.wizard.selectedOutputFolder = filePath;
    });

    // Happens if a file with the same hub name already exists in the directory
    this.electronService.ipcRenderer.on('pleaseFixHubName', (event) => {
      this.importStage = 0;
    });

    // Progress bar messages
    // for META EXTRACTION
    // stage = 0 hides progress bar
    // stage = 1 shows meta progress
    // stage = 2 shows jpg progress
    this.electronService.ipcRenderer.on('processingProgress', (event, a: number, b: number, stage: number) => {
      this.importStage = stage;
      this.progressNum1 = a;
      this.progressNum2 = b;
      this.progressPercent = a / b;
      this.progressString = 'loading - ' + Math.round(a * 100 / b) + '%';
      if (this.importStage === 2) {
        if (this.isFirstRunEver) {
          this.toggleButton('showThumbnails');
          console.log('SHOULD FIX THE FIRST RUN BUG!!!');
          this.isFirstRunEver = false;
        }
        this.extractionPercent = Math.round(100 * a / b);
      }
      if (a === b) {
        this.extractionPercent = 1;
        this.importStage = 0;
        this.appState.hubName = this.hubNameToRemember; // could this cause bugs ??? TODO: investigate!
      }
    });

    // Final object returns
    this.electronService.ipcRenderer.on('finalObjectReturning', (
      event,
      finalObject: FinalObject,
      pathToFile: string,
      outputFolderWithTrailingSlash: string,
      changedRootFolder = false
    ) => {
      this.finalArrayNeedsSaving = changedRootFolder;
      this.appState.currentVhaFile = pathToFile;
      this.hubNameToRemember = finalObject.hubName;
      this.appState.hubName = finalObject.hubName;
      this.appState.numOfFolders = finalObject.numOfFolders;
      this.appState.selectedOutputFolder = outputFolderWithTrailingSlash;
      this.appState.selectedSourceFolder = finalObject.inputDir;

      // Update history of opened files
      this.updateVhaFileHistory(pathToFile, finalObject.inputDir, finalObject.hubName);

      this.setTags(finalObject.addTags, finalObject.removeTags);

      this.canCloseWizard = true;
      this.showWizard = false;
      this.finalArray = this.demo ? finalObject.images.slice(0, 50) : finalObject.images;
      this.buildFileMap();
      this.flickerReduceOverlay = false;
    });

    // Returning settings
    this.electronService.ipcRenderer.on('settingsReturning', (
      event,
      settingsObject: SettingsObject,
      userWantedToOpen: string,
      locale: string
    ) => {
      this.vhaFileHistory = (settingsObject.vhaFileHistory || []);
      this.restoreSettingsFromBefore(settingsObject);
      this.setOrRestoreLanguage(settingsObject.appState.language, locale);
      if (this.appState.currentZoomLevel !== 1) {
        this.electronService.webFrame.setZoomFactor(this.appState.currentZoomLevel);
      }
      if (userWantedToOpen) {
        this.loadThisVhaFile(userWantedToOpen);
      } else if (settingsObject.appState.currentVhaFile) {
        this.loadThisVhaFile(settingsObject.appState.currentVhaFile);
      } else {
        this.showWizard = true;
        this.flickerReduceOverlay = false;
      }
    });

    this.electronService.ipcRenderer.on('pleaseOpenWizard', (event, firstRun) => {
      // Correlated with the first time ever starting the app !!!
      // Can happen when no settings present
      // Can happen when trying to open a .vha file that no longer exists
      if (firstRun) {
        this.firstRunLogic();
      }
      this.showWizard = true;
      this.flickerReduceOverlay = false;
    });

    this.justStarted();
  }

  ngAfterViewInit() {
    this.updateGalleryWidthMeasurement(); // so that fullView knows its size
    // this is required, otherwise when user drops the file, it opens as plaintext
    document.ondragover = document.ondrop = (ev) => {
      ev.preventDefault();
    };
    document.body.ondrop = (ev) => {
      if (ev.dataTransfer.files.length > 0) {
        const fullPath = ev.dataTransfer.files[0].path;
        ev.preventDefault();
        if (fullPath.slice(-4) === '.vha') {
          this.electronService.ipcRenderer.send(
            'load-this-vha-file', ev.dataTransfer.files[0].path, this.saveVhaIfNeeded()
          );
        }
      }
    };
  }

  /**
   * Low-tech debounced scroll handler
   * @param msDelay - number of milliseconds to debounce; if absent sets to 250ms
   */
  public debounceUpdateMax(msDelay?: number): void {
    // console.log('debouncing');
    const delay = msDelay !== undefined ? msDelay : 250;
    clearTimeout(this.myTimeout);
    this.myTimeout = setTimeout(() => {
      // console.log('Virtual scroll refreshed');
      this.virtualScroller.refresh();
      if (this.appState.currentView === 'fullView') {
        this.updateGalleryWidthMeasurement();
      }
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
    this.electronService.ipcRenderer.send('load-this-vha-file', fullPath, this.saveVhaIfNeeded());
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
    this.importStage = 1;
    const importOptions: ImportSettingsObject = {
      exportFolderPath: this.wizard.selectedOutputFolder,
      hubName: (this.futureHubName || 'untitled'),
      imgHeight: this.screenshotSizeForImport,
      numberOfScreenshots: this.numOfScreenshots,
      videoDirPath: this.wizard.selectedSourceFolder
    };
    this.electronService.ipcRenderer.send('start-the-import', importOptions, this.wizard.listOfFiles);
  }

  public cancelCurrentImport(): void {
    this.importStage = 0;
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
    this.electronService.ipcRenderer.send('close-window', this.getSettingsForSave(), this.saveVhaIfNeeded());
  }

  /**
   * Returns the finalArray if needed, otherwise returns `null`
   * completely depends on global variable `finalArrayNeedsSaving`
   */
  public saveVhaIfNeeded(): SavableProperties {
    if (this.finalArrayNeedsSaving || this.tagsSaveService.needToSave()) {
      const propsToReturn: SavableProperties = {
        addTags: this.tagsSaveService.getAddTags(),
        removeTags: this.tagsSaveService.getRemoveTags(),
        images: this.finalArray
      };
      return propsToReturn;
    } else {
      return null;
    }
  }

  public handleClick(event: MouseEvent, item: ImageElement) {
    // ctrl/cmd + click for thumbnail sheet
    if (event.ctrlKey === true || event.metaKey) {
      this.openThumbnailSheet(item);
    } else {
      this.openVideo(item.hash);
    }
  }

  public openVideo(imageId): void {
    const number = this.fileMap.get(imageId);
    this.currentPlayingFolder = this.finalArray[number].partialPath;
    this.currentPlayingFile = this.finalArray[number].cleanName;
    const fullPath = this.appState.selectedSourceFolder + this.finalArray[number].partialPath + '/' + this.finalArray[number].fileName;
    this.electronService.ipcRenderer.send('openThisFile', fullPath);
    console.log(fullPath);
    this.fullPathToCurrentFile = fullPath;
  }

  public openOnlineHelp(): void {
    this.electronService.ipcRenderer.send('pleaseOpenUrl', 'http://www.videohubapp.com');
  }

  public increaseZoomLevel(): void {
    if (this.appState.currentZoomLevel < 2.5) {
      this.appState.currentZoomLevel = this.appState.currentZoomLevel + 0.1;
      this.electronService.webFrame.setZoomFactor(this.appState.currentZoomLevel);
    }
  }

  public decreaseZoomLevel(): void {
    if (this.appState.currentZoomLevel > 0.6) {
      this.appState.currentZoomLevel = this.appState.currentZoomLevel - 0.1;
      this.electronService.webFrame.setZoomFactor(this.appState.currentZoomLevel);
    }
  }

  public resetZoomLevel(): void {
    if (this.appState.currentZoomLevel !== 1) {
      this.appState.currentZoomLevel = 1;
      this.electronService.webFrame.setZoomFactor(this.appState.currentZoomLevel);
    }
  }

  // -----------------------------------------------------------------------------------------------
  // handle output from top.component

  /**
   * Add filter to FILE search when word in file is clicked
   * @param filter
   */
  handleFileWordClicked(filter: string, event?): void {
    this.showSidebar();
    if (event && event.shiftKey) { // Shift click to exclude
      if (!this.settingsButtons['exclude'].toggled) {
        this.settingsButtons['exclude'].toggled = true;
      }
      this.onEnterKey(filter, 4); // 4th item is the `file` exlcude filter
    } else {
      if (!this.settingsButtons['file'].toggled) {
        this.settingsButtons['file'].toggled = true;
      }
      this.onEnterKey(filter, 3); // 3rd item is the `file` filter
    }
  }

  /**
   * Add filter to FOLDER search when word in folder is clicked
   * @param filter
   */
  handleFolderWordClicked(filter: string): void {
    if (this.settingsButtons['showFoldersOnly']) {
      this.toggleButton('showFiles'); // needed when we're in folder view
    }
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
      this.updateGalleryWidthMeasurement();
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
    (this.finalArray || []).forEach((element, index) => {
      this.fileMap.set(element.hash, index);
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
    };

    let matchFound = false;

    (this.vhaFileHistory || []).forEach((element: any, index: number) => {
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

  tagClicked(event: string): void {
    this.filters[3].array = []; // clear search array
    this.handleFileWordClicked(event);
    this.toggleButton('showTags'); // close the modal
  }

  /**
   * Toggles all views buttons off
   * A helper function for `toggleBotton`
   */
  toggleAllViewsButtonsOff(): void {
    this.settingsButtons['showClips'].toggled = false;
    this.settingsButtons['showFiles'].toggled = false;
    this.settingsButtons['showFilmstrip'].toggled = false;
    this.settingsButtons['showFoldersOnly'].toggled = false;
    this.settingsButtons['showFullView'].toggled = false;
    this.settingsButtons['showThumbnails'].toggled = false;
  }

  /**
   * Perform appropriate action when a button is clicked
   * @param   uniqueKey   the uniqueKey string of the button
   */
  toggleButton(uniqueKey: string): void {
    if (uniqueKey === 'showThumbnails') {
      this.toggleAllViewsButtonsOff();
      this.settingsButtons['showThumbnails'].toggled = true;
      this.appState.currentView = 'thumbs';
      this.computeTextBufferAmount();
      this.scrollToTop();
    } else if (uniqueKey === 'showFilmstrip') {
      this.toggleAllViewsButtonsOff();
      this.settingsButtons['showFilmstrip'].toggled = true;
      this.appState.currentView = 'filmstrip';
      this.computeTextBufferAmount();
      this.scrollToTop();
    } else if (uniqueKey === 'showFiles') {
      this.toggleAllViewsButtonsOff();
      this.settingsButtons['showFiles'].toggled = true;
      this.appState.currentView = 'files';
      this.computeTextBufferAmount();
      this.scrollToTop();
    } else if (uniqueKey === 'showFoldersOnly') {
      this.toggleAllViewsButtonsOff();
      this.settingsButtons['showFoldersOnly'].toggled = true;
      this.appState.currentView = 'files';
      this.computeTextBufferAmount();
      this.scrollToTop();
    } else if (uniqueKey === 'showClips') {
      this.toggleAllViewsButtonsOff();
      this.settingsButtons['showClips'].toggled = true;
      this.appState.currentView = 'clips';
      this.computeTextBufferAmount();
      this.scrollToTop();
    } else if (uniqueKey === 'showFullView') {
      this.toggleAllViewsButtonsOff();
      this.settingsButtons['showFullView'].toggled = true;
      this.appState.currentView = 'fullView';
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
    } else if (uniqueKey === 'importNewFiles') {
      this.importNewFiles();
    } else if (uniqueKey === 'verifyThumbnails') {
      this.verifyThumbnails();
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
          this.virtualScroller.refresh();
          this.updateGalleryWidthMeasurement();
        }, 300);
      }
    }
  }

  public showSettingsGroup(group: number): void {
    this.settingToShow = group;
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
      listOfFiles: [],
      totalImportTime: 0,
      totalImportSize: 0,
      selectedSourceFolder: '',
      selectedOutputFolder: ''
    };
    this.numOfScreenshots = 10; // default
    this.screenshotSizeForImport = 288; // default
    this.toggleSettings();
    this.showWizard = true;
  }

  /**
   * Scan for new files and import them
   */
  public importNewFiles(): void {
    this.progressNum1 = 0;
    this.importStage = 1;
    this.toggleSettings();
    console.log('scanning for new files');
    this.electronService.ipcRenderer.send('import-new-files', this.finalArray);
  }

  /**
   * Verify all files have thumbnails
   */
  public verifyThumbnails(): void {
    this.progressNum1 = 0;
    this.importStage = 2;
    this.toggleSettings();
    console.log('verifying thumbnails');
    this.electronService.ipcRenderer.send('verify-thumbnails', this.finalArray);
  }

  /**
   * Rescan the current input directory
   */
  public rescanDirectory(): void {
    this.progressNum1 = 0;
    this.importStage = 1;
    this.toggleSettings();
    console.log('rescanning');
    this.electronService.ipcRenderer.send('rescan-current-directory', this.finalArray);
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
    if (this.appState.currentView === 'clips' || this.appState.currentView === 'thumbs') {
      this.previewWidth = this.imgHeight * (16 / 9);
    }
  }

  /**
   * Compute and update the galleryWidth
   */
  public updateGalleryWidthMeasurement(): void {
    this.galleryWidth = document.getElementById('scrollDiv').getBoundingClientRect().width;
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
    } else if (this.appState.currentView === 'clips') {
      if (this.settingsButtons.showMoreInfo.toggled) {
        this.textPaddingHeight = 55;
      } else {
        this.textPaddingHeight = 20;
      }
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
   * @param pxHeightForImport - string of number of pixels for the height of each screenshot
   */
  selectScreenshotSize(pxHeightForImport: string) {
    // TODO better prediction
    const height = parseInt(pxHeightForImport, 10);
    this.wizard.totalImportSize = Math.round((height / 100) * this.wizard.totalNumberOfFiles * 36 / 1000);
    this.screenshotSizeForImport = height;
  }

  /**
   * Called on screenshot size dropdown select
   * @param numOfScreenshots - string of number of screenshots per video
   */
  selectNumOfScreenshots(numOfScreenshots: string) {
    this.numOfScreenshots = parseFloat(numOfScreenshots);
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
      appState: this.appState,
      buttonSettings: buttonSettings,
      vhaFileHistory: this.vhaFileHistory,
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
      });
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
  restoreSettingsFromBefore(settingsObject: SettingsObject): void {
    if (settingsObject.appState) {
      this.appState = settingsObject.appState;
      if (!settingsObject.appState.currentZoomLevel) {  // catch error <-- old VHA apps didn't have `currentZoomLevel`
        this.appState.currentZoomLevel = 1;
      }
    }
    this.imgHeight = this.appState.imgHeight;
    this.grabAllSettingsKeys().forEach(element => {
      if (settingsObject.buttonSettings[element]) {
        this.settingsButtons[element].toggled = settingsObject.buttonSettings[element].toggled;
        this.settingsButtons[element].hidden = settingsObject.buttonSettings[element].hidden;
      }
    });
    this.computeTextBufferAmount();
    this.settingsButtons['showTags'].toggled = false; // never show tags on load (they don't load right anyway)
  }

  /**
   * Restore the language from settings or try to set it from the user's locale
   * @param storedSetting the `language` attribute in AppState
   * @param locale the string that comes from `app.getLocale()`
   * List of locales is here: https://github.com/electron/electron/blob/master/docs/api/locales.md
   */
  setOrRestoreLanguage(chosenLanguage: SupportedLanguage, locale: string): void {
    if (chosenLanguage) {
      this.changeLanguage(chosenLanguage);
    } else {
      this.changeLanguage(<any>locale.substring(0, 2));
    }
  }

  /**
   * Update the min and max resolution for the resolution filter
   * @param selection
   */
  newResFilterSelected(selection: number[]): void {
    this.freqLeftBound = selection[0];
    this.freqRightBound = selection[1];
  }

  clearLev(): void {
    this.showSimilar = false;
  }

  /**
   * Handle right-click and `Show similar`
   */
  showSimilarNow(): void {
    this.findMostSimilar = this.currentRightClickedItem.cleanName;
    console.log(this.findMostSimilar);
    this.showSimilar = true;
  }

  /**
   * handle right-click and `Open folder`
   * Code similar to `openVideo()`
   */
  openContainingFolderNow(): void {
    this.fullPathToCurrentFile = this.appState.selectedSourceFolder +
                                 this.currentRightClickedItem.partialPath +
                                 '/' +
                                 this.currentRightClickedItem.fileName;

    this.openInExplorer();
  }

  /**
   * Handle right-click on file and `view folder`
   */
  showOnlyThisFolderNow(): void {
    this.handleFolderWordClicked(this.currentRightClickedItem.partialPath);
  }

  rightMouseClicked(event: MouseEvent, item): void {

    event.stopPropagation(); // so that the gallery background event listener (`scrollable-content`) doesn't fire

    if (item === null) {
      this.clickedOnFile = false;
    } else {
      this.clickedOnFile = true;
    }

    const winWidth: number = window.innerWidth;
    const clientX: number = event.clientX;
    const howFarFromRight: number = winWidth - clientX;

    // handle top-offset if clicking close to the bottom
    const winHeight: number = window.innerHeight;
    const clientY: number = event.clientY;
    const howFarFromBottom: number = winHeight - clientY;

    this.rightClickPosition.x = (howFarFromRight < 120) ? clientX - 120 + (howFarFromRight) : clientX;
    this.rightClickPosition.y = (howFarFromBottom < 140) ? clientY - 140 + (howFarFromBottom) : clientY;

    this.currentRightClickedItem = item;
    this.rightClickShowing = true;
  }

  /**
   * Opens the thumbnail sheet for the selected video
   */
  openThumbnailSheet(item: ImageElement): void {
    this.itemToDisplay = item;
    this.sheetDisplay = true;
  }

  /**
   * Opens rename file modal, prepares all the name and extension
   */
  openRenameFileModal(): void {
    // prepare file name without extension:
    this.renameErrMsg = '';
    const item = this.currentRightClickedItem;

    // .slice() creates a copy
    const fileName = item.fileName.slice().substr(0, item.fileName.lastIndexOf('.'));
    const extension = item.fileName.slice().split('.').pop();

    this.renamingWIP = fileName;
    this.renamingExtension = extension;

    this.itemToRename = item;
    this.renamingNow = true;

    setTimeout(() => {
      this.renameFileInput.nativeElement.focus();
    }, 0);
  }

  /**
   * Close the thumbnail sheet
   */
  closeSheetDisplay() {
    this.sheetDisplay = false;
  }

  /**
   * Close the rename dialog
   */
  closeRename() {
    this.renamingNow = false;
  }

  /**
   * Attempt to rename file
   * check for simple errors locally
   * ask Node to perform rename after
   */
  attemptToRename() {
    this.nodeRenamingFile = true;
    this.renameErrMsg = '';

    const sourceFolder = this.appState.selectedSourceFolder;
    const relativeFilePath = this.currentRightClickedItem.partialPath;
    const originalFile = this.currentRightClickedItem.fileName;
    const newFileName = this.renamingWIP + '.' + this.renamingExtension;
    // check if different first !!!
    if (originalFile === newFileName) {
      this.renameErrMsg = 'RIGHTCLICK.errorMustBeDifferent';
      this.nodeRenamingFile = false;
    } else if (this.renamingWIP.length === 0 ) {
      this.renameErrMsg = 'RIGHTCLICK.errorMustNotBeEmpty';
      this.nodeRenamingFile = false;
    } else {
      // try renaming
      this.electronService.ipcRenderer.send(
        'try-to-rename-this-file',
        sourceFolder,
        relativeFilePath,
        originalFile,
        newFileName
      );
    }
  }

  /**
   * Searches through the `finalArray` and updates the file name and display name
   */
  replaceOriginalFileName(): void {
    const oldFileName = this.currentRightClickedItem.fileName;

    for (let i = 0; i < this.finalArray.length; i++) {
      if (this.finalArray[i].fileName === oldFileName) {
        this.finalArray[i].fileName = this.renamingWIP + '.' + this.renamingExtension;
        this.finalArray[i].cleanName = this.renamingWIP;
        break;
      }
    }

    this.finalArrayNeedsSaving = true;
  }

  /**
   * For ternary in `home.component` template when right-clicking on folder instead of file
   */
  doNothing(): void {
    // do nothing
  }

  /**
   * Add and remove tags from the TagsSaveService
   * triggered on vha file load
   * @param addTags
   * @param removeTags
   */
  setTags(addTags: string[], removeTags: string[]): void {
    this.tagsSaveService.restoreSavedTags(
      addTags ? addTags : [],
      removeTags ? removeTags : []
    );
  }

  /**
   * Change the language via ngx-translate
   * `en` is the default
   * @param language
   */
  changeLanguage(language: SupportedLanguage): void {
    switch (language) {
      case 'ru':
        this.translate.use('ru');
        this.translate.setTranslation('ru', Russian );
        this.appState.language = 'ru';
        break;
      case 'fr':
        this.translate.use('fr');
        this.translate.setTranslation('fr', French );
        this.appState.language = 'fr';
        break;
      default:
        this.translate.use('en');
        this.translate.setTranslation('en', English );
        this.appState.language = 'en';
        break;
    }
  }

  /**
   * Run when user starts the app for the first time
   * Gets triggered when the settings.json is missing from the app folder
   */
  firstRunLogic(): void {
    console.log('WELCOME TO VIDEO HUB APP!');
    console.log('this is the first time you are running this app');
    this.isFirstRunEver = true;
  }

}
