import { Component, ChangeDetectorRef, OnInit, HostListener, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';
import { VirtualScrollerComponent } from 'ngx-virtual-scroller';

import { AutoTagsSaveService } from './tags/tags-save.service';
import { ElectronService } from '../../providers/electron.service';
import { ManualTagsService } from './manual-tags/manual-tags.service';
import { ResolutionFilterService, ResolutionString } from '../../components/pipes/resolution-filter.service';
import { ShowLimitService } from '../../components/pipes/show-limit.service';
import { StarFilterService } from '../pipes/star-filter.service';
import { WordFrequencyService } from '../../components/pipes/word-frequency.service';

import { FinalObject, ImageElement } from '../common/final-object.interface';
import { HistoryItem } from '../common/history-item.interface';
import { ImportSettingsObject } from '../common/import.interface';
import { SavableProperties } from '../common/savable-properties.interface';
import { SettingsObject } from '../common/settings-object.interface';
import { SortType } from '../pipes/sorting.pipe';
import { TagEmission, StarEmission, YearEmission } from './details/details.component';
import { WizardOptions } from '../common/wizard-options.interface';

import { AppState, SupportedLanguage, defaultImgsPerRow, RowNumbers, allSupportedViews, SupportedView } from '../common/app-state';
import { Filters, filterKeyToIndex, FilterKeyNames } from '../common/filters';
import { SettingsButtons, SettingsButtonsGroups, SettingsMetaGroupLabels, SettingsMetaGroup } from '../common/settings-buttons';

import { English } from '../../i18n/en';
import { French } from '../../i18n/fr';
import { Russian } from '../../i18n/ru';
import { BrazilianPortuguese } from '../../i18n/pt_br';

import { globals } from '../../../../main-globals';

import {
  buttonAnimation,
  donutAppear,
  filterItemAppear,
  galleryItemAppear,
  historyItemRemove,
  modalAnimation,
  myWizardAnimation,
  overlayAppear,
  rightClickAnimation,
  rightClickContentAnimation,
  similarResultsText,
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
    buttonAnimation,
    donutAppear,
    filterItemAppear,
    galleryItemAppear,
    historyItemRemove,
    modalAnimation,
    myWizardAnimation,
    overlayAppear,
    rightClickAnimation,
    rightClickContentAnimation,
    similarResultsText,
    slowFadeIn,
    slowFadeOut,
    topAnimation
  ]
})
export class HomeComponent implements OnInit, AfterViewInit {

  @ViewChild('magicSearch', {static: false}) magicSearch: ElementRef;
  @ViewChild('renameFileInput', {static: false}) renameFileInput: ElementRef;
  @ViewChild('searchRef', {static: false}) searchRef: ElementRef;
  @ViewChild('sortFilterElement', {static: false}) sortFilterElement: ElementRef;

  // used to grab the `scrollable-content` element - background of gallery for right-click
  galleryBackgroundRef: any;

  @ViewChild(VirtualScrollerComponent, {static: false})
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
  macVersion = false;
  // !!! make sure to update the `globals.version` and the `package.json` version numbers !!!
  // ========================================================================================

  versionNumber = globals.version;

  public finalArray: ImageElement[] = [];

  vhaFileHistory: HistoryItem[] = [];

  myTimeout = null;

  // ========================================================================
  // App state / UI state
  // ------------------------------------------------------------------------

  appMaximized = false;
  buttonsInView = false;
  finalArrayNeedsSaving: boolean = false; // if ever a file was renamed, re-save the .vha file
  flickerReduceOverlay = true;
  isFirstRunEver = false;
  rootFolderLive: boolean = true; // set to `false` when loading hub but video folder is not connected

  // ========================================================================
  // Import / extraction progress
  // ------------------------------------------------------------------------

  extractionPercent = 1;
  importStage = 0;
  progressNum1 = 0;
  progressNum2 = 100;
  progressPercent = 0;
  progressString = '';

  // ========================================================================
  // Gallery thumbnails
  // ------------------------------------------------------------------------

  currentImgsPerRow: number = 5;
  galleryWidth: number;
  imgsPerRow: RowNumbers = defaultImgsPerRow;
  previewHeight: number = 144;
  previewHeightRelated: number = 144;   // For the Related Videos tab:
  previewWidth: number;
  previewWidthRelated: number;          // For the Related Videos tab:
  textPaddingHeight: number;            // for text padding below filmstrip or thumbnail element

  // ========================================================================
  // Duration filter
  // ------------------------------------------------------------------------

  lengthLeftBound: number = 0;
  lengthRightBound: number = Infinity;

  // ========================================================================
  // Frequency / histogram
  // ------------------------------------------------------------------------

  resolutionFreqArr: number[];
  freqLeftBound: number = 0;
  freqRightBound: number = 4;
  resolutionNames: ResolutionString[] = ['SD', '720', '1080', '4K'];

  // ========================================================================
  // Star filter
  // ------------------------------------------------------------------------

  starRatingFreqArr: number[];
  starLeftBound: number = 0;
  starRightBound: number = 6;
  starRatingNames: string[] = ['N/A', '1', '2', '3', '4', '5'];
  forceStarFilterUpdate: boolean = true;

  // ========================================================================
  // Right-click / Renaming functionality
  // ------------------------------------------------------------------------

  clickedOnFile: boolean;        // whether right-clicked on file or gallery background
  currentRightClickedItem: ImageElement;
  itemToRename: ImageElement;
  nodeRenamingFile: boolean = false;
  renameErrMsg: string = '';
  renamingExtension: string;
  renamingNow: boolean = false;
  renamingWIP: string;           // ngModel for renaming file
  rightClickPosition: any = { x: 0, y: 0 };
  rightClickShowing: boolean = false;

  // ========================================================================
  // Thumbnail Sheet Overlay Display
  // ------------------------------------------------------------------------

  sheetItemToDisplay: ImageElement;
  sheetOverlayShowing: boolean = false;

  // ========================================================================
  // Variables for the wizard during import
  // ------------------------------------------------------------------------

  canCloseWizard = false;

  wizard: WizardOptions = {
    clipSnippetLength: 1,
    clipSnippets: 9,
    extractClips: false,
    futureHubName: '',
    listOfFiles: [],
    screensPerVideo: true,
    screenshotSizeForImport: 288,
    selectedOutputFolder: '',
    selectedSourceFolder: '',
    showWizard: false,
    ssConstant: 10,
    ssVariable: 5,
    totalImportSize: 0,
    totalImportTime: 0,
    totalNumberOfFiles: -1,
  };

  // ========================================================================
  // UNSORTED -- @TODO -- CLEAN UP !!!
  // ------------------------------------------------------------------------

  currentPlayingFile = '';
  currentPlayingFolder = '';
  fullPathToCurrentFile = '';

  magicSearchString = '';

  wordFreqArr: any;
  currResults: any = { showing: 0, total: 0 };

  findMostSimilar: string; // for finding similar files to this one
  showSimilar: boolean = false; // to toggle the similarity pipe

  shuffleTheViewNow = 0; // dummy number to force re-shuffle current view

  hubNameToRemember = ''; // don't remember what this variable is for

  sortType: SortType = 'default';

  manualTagFilterString: string = '';
  manualTagShowFrequency: boolean = true;

  durationOutlierCutoff: number = 0; // for the duration filter to cut off outliers

  // ========================================================================
  // Please add new variables below if they don't fit into any other section
  // ------------------------------------------------------------------------

  detailsMaxWidth: number = 1000; // used to keep track of max width for details in details view
  tagTypeAhead: string = '';

  // ========================================================================

  // Listen for key presses
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // .metaKey is for mac `command` button
    if (event.ctrlKey === true || event.metaKey) {
      if (event.key === 's') {
        this.shuffleTheViewNow++;
      } else if (event.key === 'o') {
        if (this.wizard.showWizard === false) {
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
        this.toggleButton('showFullView');
      } else if (event.key === '4') {
        this.toggleButton('showDetails');
      } else if (event.key === '5') {
        this.toggleButton('showFiles');
      } else if (event.key === '6') {
        this.toggleButton('showClips');
      } else if (event.key === 'h') {
        this.toggleButton('hideTop');
        this.toggleButton('hideSidebar');
        this.toggleSettingsMenu();
        this.toggleButton('showMoreInfo');
      } else if (event.key === 'a') {
        this.toggleButton('hideSidebar');
      } else if (event.key === 'g') {
        if (!this.settingsButtons['magic'].toggled) {
          this.settingsButtons['magic'].toggled = true;
        }
        this.showSidebar();
        setTimeout(() => {
          this.magicSearch.nativeElement.focus();
        }, 1);
      }
    } else if (event.key === 'Escape' && this.wizard.showWizard === true && this.canCloseWizard === true) {
      this.wizard.showWizard = false;
    } else if (event.key === 'Escape' && this.buttonsInView) {
      this.buttonsInView = false;
    } else if (event.key === 'Escape' && (this.rightClickShowing || this.renamingNow || this.sheetOverlayShowing)) {
      this.rightClickShowing = false;
      this.renamingNow = false;
      this.sheetOverlayShowing = false;
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
    public manualTagsService: ManualTagsService,
    public resolutionFilterService: ResolutionFilterService,
    public showLimitService: ShowLimitService,
    public starFilterService: StarFilterService,
    public tagsSaveService: AutoTagsSaveService,
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
      this.starFilterService.finalStarMapBehaviorSubject.subscribe((value) => {
        this.starRatingFreqArr = value;
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
      //   this.wizard.showWizard = false;
      //   this.finalArray = finalObject.images;
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

    // Happens on a Mac when the OS Dark Mode is enabled/disabled
    this.electronService.ipcRenderer.on('osDarkModeChange', (event, mode: string) => {
      console.log('OS DARK MODE CHANGE!!!');
      console.log(mode);
    });

    // Progress bar messages
    // for META EXTRACTION
    // stage = 0 hides progress bar
    // stage = 1 shows meta progress
    // stage = 2 shows jpg progress
    this.electronService.ipcRenderer.on('processingProgress', (
      event,
      current: number,
      total: number,
      stage: number
    ) => {
      console.log('receiving META SCAN UPDATE !!!' + current);
      this.importStage = stage;
      this.progressNum1 = current;
      this.progressNum2 = total;
      this.progressPercent = current / total;
      this.progressString = 'loading - ' + Math.round(current * 100 / total) + '%';
      if (this.importStage === 2) {
        if (this.isFirstRunEver) {
          this.toggleButton('showThumbnails');
          console.log('SHOULD FIX THE FIRST RUN BUG!!!');
          this.isFirstRunEver = false;
        }
        this.extractionPercent = Math.round(100 * current / total);
      }
      if (current === total) {
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
      changedRootFolder: boolean = false,
      rootFolderLive: boolean = true,
    ) => {
      this.rootFolderLive = rootFolderLive;
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
      this.manualTagsService.populateManualTagsService(finalObject.images);

      this.finalArray = this.demo ? finalObject.images.slice(0, 50) : finalObject.images;

      this.canCloseWizard = true;
      this.wizard.showWizard = false;
      this.flickerReduceOverlay = false;

      this.setUpDurationFilterValues(this.finalArray);
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
        this.wizard.showWizard = true;
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
      this.wizard.showWizard = true;
      this.flickerReduceOverlay = false;
    });

    this.justStarted();
  }

  ngAfterViewInit() {
    this.computePreviewWidth(); // so that fullView knows its size
    // this is required, otherwise when user drops the file, it opens as plaintext
    document.ondragover = document.ondrop = (ev) => {
      ev.preventDefault();
    };
    document.body.ondrop = (ev) => {
      if (ev.dataTransfer.files.length > 0) {
        const fullPath = ev.dataTransfer.files[0].path;
        ev.preventDefault();
        if (fullPath.endsWith('.vha2')) {
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
      this.computePreviewWidth();
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
      clipSnippetLength: this.wizard.clipSnippetLength,
      clipSnippets: this.wizard.extractClips ? this.wizard.clipSnippets : 0,
      exportFolderPath: this.wizard.selectedOutputFolder,
      hubName: (this.wizard.futureHubName || 'untitled'),
      imgHeight: this.wizard.screenshotSizeForImport,
      screensPerVideo: this.wizard.screensPerVideo,
      ssConstant: this.wizard.ssConstant,
      ssVariable: this.wizard.ssVariable,
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
    this.savePreviousViewSize();
    this.appState.imgsPerRow = this.imgsPerRow;
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
      this.openVideo(item.index);
    }
  }

  /**
   * Open the video with user's default media player
   * @param index unique ID of the video
   */
  public openVideo(index): void {
    this.currentPlayingFolder = this.finalArray[index].partialPath;
    this.currentPlayingFile = this.finalArray[index].cleanName;
    this.finalArray[index].timesPlayed ? this.finalArray[index].timesPlayed++ : this.finalArray[index].timesPlayed = 1;
    this.finalArrayNeedsSaving = true;
    const fullPath = this.appState.selectedSourceFolder + this.finalArray[index].partialPath + '/' + this.finalArray[index].fileName;
    this.fullPathToCurrentFile = fullPath;
    console.log(fullPath);
    if (this.rootFolderLive) {
      this.electronService.ipcRenderer.send('openThisFile', fullPath);
    }
  }

  public openOnlineHelp(): void {
    this.electronService.ipcRenderer.send('pleaseOpenUrl', 'https://www.videohubapp.com');
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
      if (!this.settingsButtons['tagExclusion'].toggled) {
        this.settingsButtons['tagExclusion'].toggled = true;
      }
      this.onEnterKey(filter, 7); // 7th item is the `tag` exlcude filter
    } else {
      if (!this.settingsButtons['tagIntersection'].toggled) {
        this.settingsButtons['tagIntersection'].toggled = true;
      }
      this.onEnterKey(filter, 6); // 6th item is the `tag` filter
    }
  }

  /**
   * Add filter to FOLDER search when word in folder is clicked
   * @param filter
   */
  handleFolderWordClicked(filter: string): void {
    this.showSidebar();
    if (!this.settingsButtons['folderIntersection'].toggled) {
      this.settingsButtons['folderIntersection'].toggled = true;
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
      this.computePreviewWidth();
    }
  }

  // -----------------------------------------------------------------------------------------------
  // Interaction functions

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
    this.settingToShow = 2;
    this.buttonsInView = !this.buttonsInView;
  }

  hideWizard(): void {
    this.wizard.showWizard = false;
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
    this.settingsButtons['showDetails'].toggled = false;
    this.settingsButtons['showFiles'].toggled = false;
    this.settingsButtons['showFilmstrip'].toggled = false;
    this.settingsButtons['showFullView'].toggled = false;
    this.settingsButtons['showThumbnails'].toggled = false;
  }

  /**
   * Helper method for `toggleButton` to set `toggled` boolean true
   * @param uniqueKey
   */
  toggleButtonTrue(uniqueKey: string): void {
    this.settingsButtons[uniqueKey].toggled = true;
  }

  /**
   * Helper method for `toggleButton` to set `toggled` boolean to its opposite
   * @param uniqueKey
   */
  toggleButtonOpposite(uniqueKey: string): void {
    this.settingsButtons[uniqueKey].toggled = !this.settingsButtons[uniqueKey].toggled;
  }

  /**
   * Save the current view image size
   */
  savePreviousViewSize(): void {
    this.imgsPerRow[this.appState.currentView] = this.currentImgsPerRow;
  }

  /**
   * Restore the image height for the particular view
   */
  restoreViewSize(view: string): void {
    this.currentImgsPerRow = this.imgsPerRow[view];
  }

  /**
   * Perform appropriate action when a button is clicked
   * @param   uniqueKey   the uniqueKey string of the button
   */
  toggleButton(uniqueKey: string | SupportedView): void {
    // ======== View buttons ================
    if (allSupportedViews.includes(<SupportedView>uniqueKey)) {
      this.savePreviousViewSize();
      this.toggleAllViewsButtonsOff();
      this.toggleButtonTrue(uniqueKey);
      this.restoreViewSize(uniqueKey);
      this.appState.currentView = <SupportedView>uniqueKey;
      this.computeTextBufferAmount();
      this.scrollToTop();

    // ======== Filter buttons =========================
    } else if (FilterKeyNames.includes(uniqueKey)) {
      this.filters[filterKeyToIndex[uniqueKey]].array = [];
      this.filters[filterKeyToIndex[uniqueKey]].bool = !this.filters[filterKeyToIndex[uniqueKey]].bool;
      this.toggleButtonOpposite(uniqueKey);
    } else if (uniqueKey === 'magic') {
      this.magicSearchString = '';
      this.toggleButtonOpposite(uniqueKey);

    // ======== Other buttons ========================
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
    } else if (uniqueKey === 'regenerateLibrary') {
      this.regenerateLibrary();
    } else if (uniqueKey === 'showRelatedVideosTray') {
      this.settingsButtons.showRelatedVideosTray.toggled = !this.settingsButtons.showRelatedVideosTray.toggled;
      this.computePreviewWidth();
    } else if (uniqueKey === 'sortOrder') {
      this.sortType = 'default';
      this.toggleButtonOpposite(uniqueKey);
    } else if (uniqueKey === 'shuffleGalleryNow') {
      this.sortType = 'random';
      this.shuffleTheViewNow++;
      // in case the sort filter is showin on the sidebar:
      if (this.sortFilterElement) {
        const allOptions = this.sortFilterElement.nativeElement.options;
        allOptions[allOptions.length - 1].selected = true;
      }
    } else if (uniqueKey === 'randomizeGallery') {
      console.log('RANDOMIZE GALLERY DISABLED !!!');
      console.log('TODO - fix and test thoroughly first!');
      // if (this.settingsButtons['randomizeGallery'].toggled === true) {
      //   this.sortType = 'random';
      //   this.shuffleTheViewNow = 0;
      // }
      // this.toggleButtonOpposite(uniqueKey);
    } else {
      this.toggleButtonOpposite(uniqueKey);
      if (uniqueKey === 'showMoreInfo') {
        this.computeTextBufferAmount();
      }
      if (uniqueKey === 'hideSidebar') {
        setTimeout(() => {
          this.virtualScroller.refresh();
          this.computePreviewWidth();
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
    this.wizard = {
      clipSnippetLength: 1,
      clipSnippets: 9,
      extractClips: false,
      futureHubName: '',
      listOfFiles: [],
      screensPerVideo: true,
      screenshotSizeForImport: 288, // default
      selectedOutputFolder: '',
      selectedSourceFolder: '',
      showWizard: true,
      ssConstant: 3,
      ssVariable: 10,
      totalImportSize: 0,
      totalImportTime: 0,
      totalNumberOfFiles: -1,
    };
    this.toggleSettings();
  }


  // ==========================================================================================
  // Methods for RESCAN
  // ==========================================================================================

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
   * Regenerate the library
   */
  public regenerateLibrary(): void {
    this.progressNum1 = 0;
    this.importStage = 1;
    this.toggleSettings();
    console.log('regenerating library');
    this.electronService.ipcRenderer.send('regenerate-library', this.finalArray);
  }

  // ==========================================================================================

  /**
   * Decrease preview size
   */
  public decreaseSize(): void {
    this.currentImgsPerRow++;
    this.computePreviewWidth();
    this.virtualScroller.invalidateAllCachedMeasurements();
  }

  /**
   * Increase preview size
   */
  public increaseSize(): void {
    if (this.appState.currentView === 'showDetails') {
      if (this.currentImgsPerRow > 2) {
        this.currentImgsPerRow--;
      }
    } else if (this.currentImgsPerRow > 1) {
      this.currentImgsPerRow--;
    }
    this.computePreviewWidth();
    this.virtualScroller.invalidateAllCachedMeasurements();
  }

  /**
   * Computes the preview width for thumbnails view
   */
  public computePreviewWidth(): void {
    this.galleryWidth = document.getElementById('scrollDiv').getBoundingClientRect().width - 20;

    if (   this.appState.currentView === 'showClips'
        || this.appState.currentView === 'showThumbnails'
        || this.appState.currentView === 'showDetails') {
      this.previewWidth = (this.galleryWidth / this.currentImgsPerRow) - 40; // 40px margin

      // used in details view only
      this.detailsMaxWidth = this.galleryWidth - this.previewWidth - 40; // 40px is just an estimate here

    } else if ( this.appState.currentView === 'showFilmstrip'
             || this.appState.currentView === 'showFullView' ) {
      this.previewWidth = ((this.galleryWidth - 30) / this.currentImgsPerRow);
    }
    this.previewHeight = this.previewWidth * (9 / 16);

    // compute preview dimensions for thumbs in the most similar tab:
    if (this.settingsButtons['showRelatedVideosTray'].toggled) {
      this.previewWidthRelated = Math.min((this.galleryWidth / 5) - 40, 176);
      this.previewHeightRelated = Math.min(this.previewWidthRelated * (9 / 16), 144);
    }
  }

  /**
   * Compute the number of pixels needed to add to the preview item
   * Thumbnails need more space for the text
   * Filmstrip needs less
   */
  public computeTextBufferAmount(): void {
    this.computePreviewWidth();
    if (this.appState.currentView === 'showThumbnails') {
      if (this.settingsButtons.showMoreInfo.toggled) {
        this.textPaddingHeight = 55;
      } else {
        this.textPaddingHeight = 20;
      }
    } else if (this.appState.currentView === 'showFilmstrip') {
      if (this.settingsButtons.showMoreInfo.toggled) {
        this.textPaddingHeight = 20;
      } else {
        this.textPaddingHeight = 0;
      }
    } else if (this.appState.currentView === 'showFiles') {
      this.textPaddingHeight = 20;
    } else if (this.appState.currentView === 'showClips') {
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
    const trimmed = value.trim();
    // removes '/' from folder path if there
    // happens when user clicks folder path in file view
    if (trimmed[0] === '/') {
      this.filters[origin].array = [];
    }
    if (trimmed) {
      // don't include duplicates
      if (!this.filters[origin].array.includes(trimmed)) {
        this.filters[origin].array.push(trimmed);
        this.filters[origin].bool = !this.filters[origin].bool;
        this.filters[origin].string = '';
      }
    } else {
      this.filters[origin].array = [];
      this.filters[origin].bool = !this.filters[origin].bool;
      this.filters[origin].string = '';
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
  selectScreenshotSize(pxHeightForImport: string): void {
    const height = parseInt(pxHeightForImport, 10);
    this.wizard.screenshotSizeForImport = height;
    // TODO better prediction
    this.wizard.totalImportSize = Math.round((height / 100) * this.wizard.totalNumberOfFiles * 36 / 1000);
  }

  /**
   * Called on screenshot size dropdown select
   * @param screens - string of number of screenshots per video
   */
  selectNumOfScreens(screens: string): void {
    if (this.wizard.screensPerVideo) {
      this.wizard.ssConstant = parseFloat(screens);
    } else {
      this.wizard.ssVariable = parseFloat(screens);
    }
  }

  /**
   * Called on screenshot options selection HTML
   * @param screens - string of number of snipppets per clip
   */
  selectNumOfClipSnippets(screens: string): void {
    this.wizard.clipSnippets = parseFloat(screens);
  }

  /**
   * Called on screenshot options selection HTML
   * @param length - string of number of seconds per snippet in each clip
   */
  selectLengthOfClipSnippets(length: string): void {
    this.wizard.clipSnippetLength = parseFloat(length);
  }

  /**
   * Sets the `screensPerVideo` boolean
   * true = N screenshots per video
   * false = 1 screenshot per N minutes
   * @param bool boolean
   */
  setScreensPerVideo(bool: boolean): void {
    this.wizard.screensPerVideo = bool;
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
      if (!settingsObject.appState.imgsPerRow) {
        this.appState.imgsPerRow = defaultImgsPerRow;
      }
    }
    this.imgsPerRow = this.appState.imgsPerRow;
    this.currentImgsPerRow = this.imgsPerRow[this.appState.currentView];
    this.grabAllSettingsKeys().forEach(element => {
      if (settingsObject.buttonSettings[element]) {
        this.settingsButtons[element].toggled = settingsObject.buttonSettings[element].toggled;
        this.settingsButtons[element].hidden = settingsObject.buttonSettings[element].hidden;
      }
    });
    this.computeTextBufferAmount();

    this.settingsButtons['showTags'].toggled = false; // never show tags on load (they don't load right anyway)

    if (this.settingsButtons['showTagTray'].toggled) {
      this.settingsButtons['showTagTray'].toggled = false;
      setTimeout(() => {
        this.settingsButtons['showTagTray'].toggled = true; // needs a delay to show up correctly
      }, 100);
    }
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

  /**
   * Update the min and max star rating for the star filter
   * @param selection
   */
  newStarFilterSelected(selection: number[]): void {
    this.starLeftBound = selection[0];
    this.starRightBound = selection[1];
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
    this.sheetItemToDisplay = item;
    this.sheetOverlayShowing = true;
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
  closeSheetOverlay() {
    this.sheetOverlayShowing = false;
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
   * TODO -- BUG?!?? -- check if this errors out when hub has two files with duplicate file names !!!
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
   * Add and remove tags from the AutoTagsSaveService
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
      case 'pt_br':
        this.translate.use('pt_br');
        this.translate.setTranslation('pt_br', BrazilianPortuguese );
        this.appState.language = 'pt_br';
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

  /**
   * Add tag to a particular file
   * @param emission - the type, tag, and uniqe ID of the file (hash)
   */
  editFinalArrayTag(emission: TagEmission): void {
    // console.log(emission);
    const position: number = emission.index;

    if (emission.type === 'add') {
      if (this.finalArray[position].tags) {
        this.finalArray[position].tags.push(emission.tag);
      } else {
        this.finalArray[position].tags = [emission.tag];
      }
    } else {
      console.log('removing tag!');
      this.finalArray[position].tags.splice(this.finalArray[position].tags.indexOf(emission.tag), 1);
    }

    this.finalArrayNeedsSaving = true;
  }

  /**
   * Update FinalArray with new star rating for some element
   * @param emission
   */
  editFinalArrayStars(emission: StarEmission): void {
    const position: number = emission.index;
    this.finalArray[position].stars = emission.stars;
    this.finalArrayNeedsSaving = true;
    this.forceStarFilterUpdate = !this.forceStarFilterUpdate;
  }

  /**
   * Update FinalArray with new year tag for some element
   * @param emission
   */
  editFinalArrayYear(emission: YearEmission): void {
    const position: number = emission.index;
    this.finalArray[position].year = emission.year;
    this.finalArrayNeedsSaving = true;
  }

  /**
   * Select a particular sort order (star rating, number of times played, etc)
   * @param type
   */
  selectFilterOrder(type: SortType): void {
    console.log(type);
    this.sortType = type;
    // this.shuffleTheViewNow++;
  }

  /**
   * Check type-ahead for the manually-added tags!
   * @param text     input text to check type-ahead
   * @param compute  whether or not to perform the lookup
   */
  checkTagTypeahead(text: string, compute: boolean) {
    if (compute) {
      this.tagTypeAhead = this.manualTagsService.getTypeahead(text);
    }
  }

  /**
   * Add tag to search when pressing tab
   * !!! but only when on the tag search field !!!
   * @param $event
   * @param execute
   * @param origin -- the `j` in the template, just pass it on to the `onEnterKey`
   */
  typeaheadTabPressed($event, execute: boolean, origin: number): void {
    if (execute) {
      if (this.tagTypeAhead !== '') {
        this.onEnterKey(this.tagTypeAhead, origin);
        this.tagTypeAhead = '';
        $event.preventDefault();
      }
    }
  }

  /*
   * Update the min and max resolution for the resolution filter
   * hacked to set rightBound to Infinity when close-enough to the right side
   * @param selection
   */
  newLengthFilterSelected(selection: number[]): void {
    this.lengthLeftBound = selection[0];

    if (selection[1] > this.durationOutlierCutoff - 10) {
      this.lengthRightBound = Infinity;
    } else {
      this.lengthRightBound = selection[1];
    }
  }

  setUpDurationFilterValues(finalArray: ImageElement[]): void {
    const durations: number[] = finalArray.map((element) => { return element.duration; });

    const cutoff = this.getOutlierCutoff(durations);

    this.durationOutlierCutoff = Math.floor(cutoff);
  }

  /**
   * Given an array of numbers
   * returns the cutoff for outliers
   * defined unconventionally as "anything beyond the 3rd quartile + 3 * IQR (the inter-quartile range)"
   * @param someArray
   */
  getOutlierCutoff(someArray: number[]): number {
    const values = someArray.slice();
    values.sort((a, b) => { return a - b; });

    const q1 = values[Math.floor((values.length / 4))];
    const q3 = values[Math.ceil((values.length * (3 / 4)))];
    const iqr = q3 - q1;

    return q3 + iqr * 3;
  }

}
