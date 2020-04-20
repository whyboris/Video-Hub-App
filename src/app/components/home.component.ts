import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

import * as path from 'path';

import { TranslateService } from '@ngx-translate/core';
import { VirtualScrollerComponent } from 'ngx-virtual-scroller';

// Services
import { AutoTagsSaveService } from './tags-auto/tags-save.service';
import { ElectronService } from '../providers/electron.service';
import { ManualTagsService } from './tags-manual/manual-tags.service';
import { ResolutionFilterService, ResolutionString } from '../pipes/resolution-filter.service';
import { PipeSideEffectService } from '../pipes/pipe-side-effect.service';
import { StarFilterService } from '../pipes/star-filter.service';
import { WordFrequencyService, WordFreqAndHeight } from '../pipes/word-frequency.service';

// Interfaces
import { DefaultScreenEmission } from './sheet/sheet.component';
import { FinalObject, ImageElement, ScreenshotSettings, AllowedScreenshotHeight } from '../../../interfaces/final-object.interface';
import { HistoryItem } from '../../../interfaces/history-item.interface';
import { ImportSettingsObject } from '../../../interfaces/import.interface';
import { ImportStage } from '../../../main-support';
import { SavableProperties } from '../../../interfaces/savable-properties.interface';
import { SettingsObject } from '../../../interfaces/settings-object.interface';
import { SortType } from '../pipes/sorting.pipe';
import { TagEmission, StarEmission, YearEmission } from './views/details/details.component';
import { WizardOptions } from '../../../interfaces/wizard-options.interface';

// Constants, etc
import { AppState, SupportedLanguage, defaultImgsPerRow, RowNumbers } from '../common/app-state';
import { allSupportedViews, SupportedView } from '../../../interfaces/shared-interfaces';
import { Filters, filterKeyToIndex, FilterKeyNames } from '../common/filters';
import { SettingsButtons, SettingsButtonsGroups, SettingsMetaGroupLabels, SettingsMetaGroup } from '../common/settings-buttons';
import { globals } from '../../../main-globals';

// Languages
const Arabic = require('../../../i18n/ar.json');
const Bengali = require('../../../i18n/bn.json');
const Chinese = require('../../../i18n/zh.json');
const English = require('../../../i18n/en.json');
const French = require('../../../i18n/fr.json');
const German = require('../../../i18n/de.json');
const Hindi = require('../../../i18n/hi.json');
const Italian = require('../../../i18n/it.json');
const Japanese = require('../../../i18n/ja.json');
const Korean = require('../../../i18n/ko.json');
const Malay = require('../../../i18n/ms.json');
const Portuguese = require('../../../i18n/pt.json');
const Russian = require('../../../i18n/ru.json');
const Spanish = require('../../../i18n/es.json');
const Ukrainian = require('../../../i18n/uk.json');

// Animations
import {
  breadcrumbWordAppear,
  breadcrumbsAppear,
  buttonAnimation,
  donutAppear,
  filterItemAppear,
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
    './breadcrumbs.scss',
    './top-buttons.scss',
    './settings.scss',
    './buttons.scss',
    './search.scss',
    './search-input.scss',
    '../fonts/icons.scss',
    './gallery.scss',
    './wizard-button.scss',
    './wizard.scss',
    './resolution.scss',
    './rightclick.scss'
  ],
  animations: [
    breadcrumbsAppear,
    breadcrumbWordAppear,
    buttonAnimation,
    donutAppear,
    filterItemAppear,
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

  @ViewChild('magicSearch', { static: false }) magicSearch: ElementRef;
  @ViewChild('fuzzySearch', { static: false }) fuzzySearch: ElementRef;
  @ViewChild('searchRef', { static: false }) searchRef: ElementRef;
  @ViewChild('sortFilterElement', { static: false }) sortFilterElement: ElementRef;

  @ViewChild(VirtualScrollerComponent, { static: false })
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
  macVersion = false;
  // !!! make sure to update the `globals.version` and the `package.json` version numbers !!!
  // webDemo = false;
  // ========================================================================================

  versionNumber = globals.version;

  public finalArray: ImageElement[] = [];

  vhaFileHistory: HistoryItem[] = [];

  myTimeout = null;

  // ========================================================================
  // App state / UI state
  // ------------------------------------------------------------------------

  appMaximized = false;
  settingsModalOpen = false;
  finalArrayNeedsSaving: boolean = false; // if ever a file was renamed, re-save the .vha file
  flickerReduceOverlay = true;
  isFirstRunEver = false;
  rootFolderLive: boolean = true; // set to `false` when loading hub but video folder is not connected

  // ========================================================================
  // Import / extraction progress
  // ------------------------------------------------------------------------

  extractionPercent = 1;
  importStage: ImportStage = 'done';
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
    clipHeight: 144,
    clipSnippetLength: 1,
    clipSnippets: 3,
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
    totalNumberOfFiles: -1,
  };

  // ========================================================================
  // UNSORTED -- TODO -- CLEAN UP !!!
  // ------------------------------------------------------------------------

  currentPlayingFile = '';
  currentPlayingFolder = '';
  fullPathToCurrentFile = '';

  magicSearchString = '';
  fuzzySearchString = '';

  wordFreqArr: WordFreqAndHeight[];
  currResults: number;

  findMostSimilar: string; // for finding similar files to this one
  showSimilar: boolean = false; // to toggle the similarity pipe

  shuffleTheViewNow = 0; // dummy number to force re-shuffle current view

  hubNameToRemember = ''; // don't remember what this variable is for

  sortType: SortType = 'default';

  manualTagFilterString: string = '';
  manualTagShowFrequency: boolean = true;

  durationOutlierCutoff: number = 0; // for the duration filter to cut off outliers

  // time remaining calculator !!!
  timeExtractionStarted;
  timeExtractionRemaining;

  folderNotConnectedErrorShowing: boolean = false;

  deletePipeHack: boolean = false; // to force deletePipe to update

  // crappy hack to remember where to navigate to when in folder view and returning back to root
  folderNavigationScrollOffset: number = 0;

  batchTaggingMode = false; // when batch tagging is enabled

  // ========================================================================
  // Please add new variables below if they don't fit into any other section
  // ------------------------------------------------------------------------

  detailsMaxWidth: number = 1000; // used to keep track of max width for details in details view
  tagTypeAhead: string = '';
  folderViewNavigationPath: string = '';

  currentScreenshotSettings: ScreenshotSettings = {
    clipHeight: 144,
    clipSnippetLength: 1,
    clipSnippets: 0,
    fixed: true,
    height: 432,
    n: 3,
  }; // currently only used for the statistics page
  // && to prevent clip view from showing when no clips extracted
  // defaults set here ONLY because when starting the app in clip view
  // the app would show error in console log:
  //   `Cannot read property 'clipSnippets' of undefined`

  // ========================================================================

  // Listen for key presses
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // .metaKey is for mac `command` button
    if (event.ctrlKey === true || event.metaKey) {

      switch (event.key) {

        case ('b'):
          this.toggleButton('hideSidebar');
          break;

        case ('i'):
          this.toggleButton('showMoreInfo');
          break;

        case ('1'):
          this.toggleButton('showThumbnails');
          break;

        case ('2'):
          this.toggleButton('showFilmstrip');
          break;

        case ('3'):
          this.toggleButton('showFullView');
          break;

        case ('4'):
          this.toggleButton('showDetails');
          break;

        case ('5'):
          this.toggleButton('showFiles');
          break;

        case ('6'):
          this.toggleButton('showClips');
          break;

        case ('s'):
          this.toggleButton('shuffleGalleryNow');
          break;

        case ('d'):
          this.toggleButton('darkMode');
          break;

        case ('z'):
          this.toggleButton('makeSmaller');
          break;

        case ('x'):
          this.toggleButton('makeLarger');
          break;

        case ('o'):
          if (this.wizard.showWizard === false) {
            this.toggleSettings();
          }
          break;

        case ('t'):
          if (!this.wizard.showWizard) {
            this.toggleButton('showTags');
          }
          break;

        case ('q'):
        case ('w'):
          event.preventDefault();
          event.stopPropagation();
          this.initiateClose();
          break;

        case ('n'):
          this.startWizard();
          this.settingsModalOpen = false;
          this.settingsButtons['showTags'].toggled = false;
          break;

        case ('h'):
          this.toggleButton('hideTop');
          this.toggleButton('hideSidebar');
          this.toggleSettingsMenu();
          this.toggleButton('showMoreInfo');
          break;

        case ('f'):
          if (this.settingsButtons['fileIntersection'].toggled === false) {
            this.settingsButtons['fileIntersection'].toggled = true;
          }
          this.showSidebar();
          setTimeout(() => {
            if (this.searchRef.nativeElement.querySelector('#fileIntersection')) {
              this.searchRef.nativeElement.querySelector('#fileIntersection').focus();
            }
          }, 1);
          break;

        case ('g'):
          if (!this.settingsButtons['magic'].toggled) {
            this.settingsButtons['magic'].toggled = true;
          }
          this.showSidebar();
          setTimeout(() => {
            this.magicSearch.nativeElement.focus();
          }, 1);
          break;

        case ('r'):
          if (!this.settingsButtons['fuzzy'].toggled) {
            this.settingsButtons['fuzzy'].toggled = true;
          }
          this.showSidebar();
          setTimeout(() => {
            this.fuzzySearch.nativeElement.focus();
          }, 1);
          break;
      }

    } else if (event.key === 'Escape' && this.wizard.showWizard === true && this.canCloseWizard === true) {
      this.wizard.showWizard = false;
    } else if (event.key === 'Escape' && this.settingsModalOpen) {
      this.settingsModalOpen = false;
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
    public pipeSideEffectService: PipeSideEffectService,
    public starFilterService: StarFilterService,
    public tagsSaveService: AutoTagsSaveService,
    public translate: TranslateService,
    public wordFrequencyService: WordFrequencyService
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang('en');
    this.changeLanguage('en');

    // To test the progress bar
    // setInterval(() => {
    //   this.importStage = this.importStage === 'importingScreenshots' ? 'importingMeta' : 'importingScreenshots';
    // }, 3000);
    // this.importStage = 'importingMeta';
    // this.importStage = 'importingScreenshots';
    // this.timeExtractionRemaining = 100;
    // setInterval(() => {
    //   this.timeExtractionRemaining = this.timeExtractionRemaining - 2;
    //   this.extractionPercent = this.extractionPercent + 8;
    //   if (this.extractionPercent > 99) {
    //     this.extractionPercent = 1;
    //   }
    // }, 2000);

    this.cloneDefaultButtonSetting();

    setTimeout(() => {
      this.wordFrequencyService.finalMapBehaviorSubject.subscribe((value: WordFreqAndHeight[]) => {
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
      this.pipeSideEffectService.searchResults.subscribe((value) => {
        this.currResults = value;
        this.cd.detectChanges();
        this.debounceUpdateMax(10);
      });

      // -- DEMO CONTENT -- hasn't been updated in over 1 year
      //                    will need updating if enabled
      // if (this.webDemo) {
      //   const finalObject = DemoContent;
      //   // should be identical to `finalObjectReturning`
      //   this.appState.numOfFolders = finalObject.numOfFolders;
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

      if (listOfFiles.length > 0) {
        this.wizard.selectedSourceFolder = filePath;
        this.wizard.selectedOutputFolder = filePath;
      }

      this.cd.detectChanges();
    });

    // Rename file response
    this.electronService.ipcRenderer.on(
      'renameFileResponse', (event, index: number, success: boolean, renameTo: string, oldFileName: string, errMsg?: string) => {

      this.nodeRenamingFile = false;

      if (success) {
        // UPDATE THE FINAL ARRAY !!!
        this.replaceFileNameInFinalArray(renameTo, oldFileName, index);
        this.closeRename();
      } else {
        this.renameErrMsg = errMsg;
        this.cd.detectChanges();
      }
    });

    // Returning Output
    this.electronService.ipcRenderer.on('outputFolderChosen', (event, filePath) => {
      this.wizard.selectedOutputFolder = filePath;
      this.cd.detectChanges();
    });

    // Happens if a file with the same hub name already exists in the directory
    this.electronService.ipcRenderer.on('pleaseFixHubName', (event) => {
      this.importStage = 'done';
      this.cd.detectChanges();
    });

    // happens when user replaced a thumbnail and process is done
    this.electronService.ipcRenderer.on('thumbnail-replaced', (event) => {
      this.electronService.webFrame.clearCache();
    });

    this.electronService.ipcRenderer.on('touchBar-to-app', (event, changesFromTouchBar: string) => {
      if (changesFromTouchBar) {
        this.toggleButton(changesFromTouchBar, true);
      }
    });

    this.electronService.ipcRenderer.on('preferred-video-player-returning', (event, filePath) => {

      this.appState.preferredVideoPlayer = filePath;

      // Hardcode for MAC & VLC
      if (this.macVersion && this.appState.preferredVideoPlayer.toLowerCase().includes('vlc')) {
        this.appState.preferredVideoPlayer = '/Applications/VLC.app/Contents/MacOS/VLC';
      }

      this.cd.detectChanges();
    });

    // Happens on a Mac when the OS Dark Mode is enabled/disabled
    this.electronService.ipcRenderer.on('osDarkModeChange', (event, desiredMode: string) => {

      const darkModeOn: boolean = this.settingsButtons['darkMode'].toggled;

      if (darkModeOn && desiredMode === 'light') {
        this.toggleButton('darkMode');
        this.cd.detectChanges();
      } else if (!darkModeOn && desiredMode === 'dark') {
        this.toggleButton('darkMode');
        this.cd.detectChanges();
      }
    });

    // Progress bar messages
    // for META EXTRACTION
    this.electronService.ipcRenderer.on('processingProgress', (
      event,
      current: number,
      total: number,
      stage: ImportStage
    ) => {

      if (current === 1) {
        this.timeExtractionStarted = new Date().getTime();
        this.electronService.ipcRenderer.send('prevent-sleep');
      }

      if (current > 3) {
        const thisInstant = new Date().getTime();
        const timeElapsed = thisInstant - this.timeExtractionStarted;
        this.timeExtractionRemaining = Math.round((total - current) * (timeElapsed / current) / 1000); // convert MS to seconds
        if (this.timeExtractionRemaining < 1) {
          this.timeExtractionRemaining = 0;
        }
      }

      this.importStage = stage;
      this.progressNum1 = current;
      this.progressNum2 = total;
      this.progressPercent = current / total;
      this.progressString = 'loading - ' + Math.round(current * 100 / total) + '%';
      if (this.importStage === 'importingScreenshots') {
        if (this.isFirstRunEver) {
          this.toggleButton('showThumbnails');
          console.log('SHOULD FIX THE FIRST RUN BUG!!!');
          this.isFirstRunEver = false;
        }
        this.extractionPercent = Math.round(100 * current / total);
      }
      if (current === total) {
        this.extractionPercent = 1;
        this.importStage = 'done';
        this.electronService.ipcRenderer.send('allow-sleep');
        this.appState.hubName = this.hubNameToRemember; // could this cause bugs ??? TODO: investigate!
      }
      this.cd.detectChanges();
    });

    // Final object returns
    this.electronService.ipcRenderer.on('finalObjectReturning', (
      event,
      finalObject: FinalObject,
      pathToFile: string,
      outputFolderPath: string,
      changedRootFolder: boolean = false,
      rootFolderLive: boolean = true,
    ) => {

      this.currentScreenshotSettings = finalObject.screenshotSettings;

      this.rootFolderLive = rootFolderLive;
      this.finalArrayNeedsSaving = changedRootFolder;
      this.appState.currentVhaFile = pathToFile;
      this.hubNameToRemember = finalObject.hubName;
      this.appState.hubName = finalObject.hubName;
      this.appState.numOfFolders = finalObject.numOfFolders;
      this.appState.selectedOutputFolder = outputFolderPath;
      this.appState.selectedSourceFolder = finalObject.inputDir;

      // Update history of opened files
      this.updateVhaFileHistory(pathToFile, finalObject.inputDir, finalObject.hubName);

      this.folderViewNavigationPath = '';

      this.manualTagsService.removeAllTags();
      this.setTags(finalObject.addTags, finalObject.removeTags);
      this.manualTagsService.populateManualTagsService(finalObject.images);

      this.finalArray = this.demo ? finalObject.images.slice(0, 50) : finalObject.images;

      this.canCloseWizard = true;
      this.wizard.showWizard = false;
      this.flickerReduceOverlay = false;

      this.setUpDurationFilterValues(this.finalArray);

      if (this.sortFilterElement) {
        this.sortFilterElement.nativeElement.value = this.sortType;
      }

      this.cd.detectChanges();
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

    // This happens when the computer is about to SHUT DOWN
    this.electronService.ipcRenderer.on('pleaseShutDownASAP', (event) => {
      this.initiateClose();
    });

    // gets called if `trash` successfully removed the file
    this.electronService.ipcRenderer.on('file-deleted', (event, element: ImageElement) => {
      // spot check it's the same element
      // just in case the message comes back after user has switched to view another hub
      if (element.fileName === this.finalArray[element.index].fileName) {
        this.finalArray[element.index].deleted = true;
        this.deletePipeHack = !this.deletePipeHack;
        this.finalArrayNeedsSaving = true;
        this.cd.detectChanges();
      }
    });

    this.justStarted();
  }

  ngAfterViewInit() {
    this.computePreviewWidth(); // so that fullView knows its size // TODO -- check if still needed!
    // this is required, otherwise when user drops the file, it opens as plaintext
    document.ondragover = document.ondrop = (ev) => {
      ev.preventDefault();
    };
    document.body.ondrop = (ev) => {
      if (ev.dataTransfer.files.length > 0) {
        const fullPath: string = ev.dataTransfer.files[0].path;
        ev.preventDefault();
        if (fullPath.endsWith('.vha2')) {
          this.electronService.ipcRenderer.send(
            'load-this-vha-file', fullPath, this.saveVhaIfNeeded()
          );
        }
      }
    };
  }

  /**
   * Handle dropping something over an item in the gallery
   * Used to handle dropping a .jpg file to replace preview!
   * @param event         drop event - containing path to possible jpg file
   * @param galleryItem   item in the gallery over which jpg was dropped
   */
  droppedSomethingOverVideo(event, galleryItem: ImageElement) {
    const pathToNewImage: string = event.dataTransfer.files[0].path.toLowerCase();
    if (
      (
        pathToNewImage.endsWith('.jpg')
        || pathToNewImage.endsWith('.jpeg')
        || pathToNewImage.endsWith('.png')
      )
      && galleryItem.cleanName !== '*FOLDER*'
    ) {
      this.electronService.ipcRenderer.send(
        'replace-thumbnail', pathToNewImage, galleryItem
      );
    }
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
  public validateHubName(event: any): boolean {
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

  /**
   * Summon a dialog to open a default video player
   */
  public chooseDefaultVideoPlayer(): void {
    this.electronService.ipcRenderer.send('select-default-video-player');
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
    this.importStage = 'importingMeta';
    const importOptions: ImportSettingsObject = {
      clipHeight: this.wizard.clipHeight,
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
    this.importStage = 'done';
    this.electronService.ipcRenderer.send('allow-sleep');
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

  /**
   * Handle clicking on an item in the gallery
   *
   * @param eventObject - contains the MouseEvent and the thumbIndex (which thumb was clicked)
   *                                                      only used in the Thumbnail
   * @param item        - ImageElement
   */
  public handleClick(eventObject: { mouseEvent: MouseEvent, thumbIndex?: number }, item: ImageElement) {

    if (this.batchTaggingMode) {
      item.selected = !item.selected;

      return;
    }

    // ctrl/cmd + click for thumbnail sheet
    if (eventObject.mouseEvent.ctrlKey === true || eventObject.mouseEvent.metaKey) {
      this.openThumbnailSheet(item);
    } else {
      this.openVideo(item.index, eventObject.thumbIndex);
    }
  }

  /**
   * Open the video with user's default media player
   * or with their preferred media player, if chosen
   *
   * @param index                 unique ID of the video
   * @param clickedThumbnailIndex an index of the thumbnail clicked
   */
  public openVideo(index: number, clickedThumbnailIndex?: number): void {
    // update number of times played
    this.finalArray[index].timesPlayed ? this.finalArray[index].timesPlayed++ : this.finalArray[index].timesPlayed = 1;
    this.finalArrayNeedsSaving = true;

    const clickedElement: ImageElement = this.finalArray[index];

    this.currentPlayingFolder = clickedElement.partialPath;
    this.currentPlayingFile = clickedElement.cleanName;
    const fullPath = path.join(
      this.appState.selectedSourceFolder,
      clickedElement.partialPath,
      clickedElement.fileName
    );
    this.fullPathToCurrentFile = fullPath;

    if (this.rootFolderLive && this.appState.preferredVideoPlayer) {
      const time: number = clickedThumbnailIndex
        ? clickedElement.duration / (clickedElement.screens + 1) * ((clickedThumbnailIndex) + 1)
        : 0;

      const execPath: string = this.appState.preferredVideoPlayer;

      this.electronService.ipcRenderer.send('openThisFileWithFlags', execPath, fullPath, this.getVideoPlayerArgs(execPath, time));
    } else if (this.rootFolderLive) {
      this.electronService.ipcRenderer.send('openThisFile', fullPath);
    }
  }

  /**
   * Determine the required arguments to open video player at particular time
   * @param playerPath  full path to user's preferred video player
   * @param time        time in seconds
   */
  public getVideoPlayerArgs(playerPath: string, time: number): string[] {
    // if user doesn't want to open at timestamp, don't!
    if (!this.settingsButtons['openAtTimestamp'].toggled) {
      return [];
    }

    // else, figure out the correct command line flags
    const argz: string[] = [];

    if (playerPath.toLowerCase().includes('vlc')) {
      argz.push('--start-time=' + time.toString()); // in seconds

    } else if (playerPath.toLowerCase().includes('mpc')) {
      argz.push('/start');
      argz.push((1000 * time).toString());          // in milliseconds

    } else if (playerPath.toLowerCase().includes('pot')) {
      argz.push('/seek=' + time.toString());        // in seconds
    }

    return argz;
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
   * @param filter - particular tag clicked
   */
  handleTagWordClicked(filter: string, event?): void {

    if (this.batchTaggingMode) {
      this.addTagToManyVideos(filter);
      return;
    }

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
   * Add filter to FILE search when word in file is clicked
   * @param filter
   */
  handleFileWordClicked(filter: string, event?): void {
    this.showSidebar();
    if (event && event.shiftKey) {
      if (!this.settingsButtons['exclude'].toggled) {
        this.settingsButtons['exclude'].toggled = true;
      }
      this.onEnterKey(filter, 4); // 3rd item is the `exclude` filter
    } else {
      if (!this.settingsButtons['fileIntersection'].toggled) {
        this.settingsButtons['fileIntersection'].toggled = true;
      }
      this.onEnterKey(filter, 3); // 3rd item is the `fileIntersection` filter
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

  /**
   * Handle clicking on FOLDER in gallery, or the folder icon in breadcrumbs, or the `UP` folder
   * @param filter
   */
  handleFolderIconClicked(filter: string): void {
    if (this.folderNavigationScrollOffset === 0) {
      this.folderNavigationScrollOffset = this.virtualScroller.viewPortInfo.scrollStartPosition;
    }

    this.folderViewNavigationPath = filter;

    this.scrollAppropriately(filter);
  }

  /**
   * Handle clicking on a particular breadcrumb
   * @param idx is roughly index of the folder depth clicked
   */
  handleBbreadcrumbClicked(idx: number): void {
    this.folderViewNavigationPath = this.folderViewNavigationPath.split('/').slice(0, idx + 1).join('/');
    this.scrollToTop();
  }

  /**
   * Scroll appropriately after navigating back to root folder
   *
   * Rather hacky thing, but works in the basic case
   * Fails if user enters folder, changes some search or sort filter, and navigates back
   */
  scrollAppropriately(filter: string) {
    if (filter === '') {
      setTimeout(() => {
        this.virtualScroller.scrollToPosition(this.folderNavigationScrollOffset, 0);
        this.folderNavigationScrollOffset = 0;
      }, 1);
    } else {
      this.scrollToTop();
    }
  }

  /**
   * Go back to root and scroll to last-seen location
   */
  breadcrumbHomeIconClick(): void {
    this.folderViewNavigationPath = '';
    this.scrollAppropriately('');
  }

  /**
   * Open folder that contains the (current) clicked file
   */
  openInExplorer(): void {
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
      this.vhaFileHistory.unshift(newHistoryItem);
    }
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
    this.settingsModalOpen = !this.settingsModalOpen;
  }

  hideWizard(): void {
    this.wizard.showWizard = false;
  }

  tagClicked(event: string): void {
    this.filters[3].array = []; // clear search array
    this.handleTagWordClicked(event);
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
   * @param   fromIpc     boolean value indicate, call from IPC
   */
  toggleButton(uniqueKey: string | SupportedView, fromIpc = false): void {
    // ======== View buttons ================
    if (allSupportedViews.includes(<SupportedView>uniqueKey)) {
      this.savePreviousViewSize();
      this.toggleAllViewsButtonsOff();
      this.toggleButtonTrue(uniqueKey);
      this.restoreViewSize(uniqueKey);
      this.appState.currentView = <SupportedView>uniqueKey;
      this.computeTextBufferAmount();
      this.virtualScroller.invalidateAllCachedMeasurements();
      this.scrollToTop();

      // ======== Filter buttons =========================
    } else if (FilterKeyNames.includes(uniqueKey)) {
      this.filters[filterKeyToIndex[uniqueKey]].array = [];
      this.filters[filterKeyToIndex[uniqueKey]].bool = !this.filters[filterKeyToIndex[uniqueKey]].bool;
      this.toggleButtonOpposite(uniqueKey);
    } else if (uniqueKey === 'magic') {
      this.magicSearchString = '';
      this.toggleButtonOpposite(uniqueKey);
    } else if (uniqueKey === 'fuzzy') {
      this.fuzzySearchString = '';
      this.toggleButtonOpposite(uniqueKey);

      // ======== Other buttons ========================
    } else if (uniqueKey === 'compactView') {
      this.toggleButtonOpposite(uniqueKey);
      if (
        this.settingsButtons['showThumbnails'].toggled
        || this.settingsButtons['showClips'].toggled
      ) {
        this.computeTextBufferAmount();
      }
    } else if (uniqueKey === 'showFolders') {
      this.toggleButtonOpposite('showFolders');
      if (!this.settingsButtons['showFolders'].toggled) {
        this.folderViewNavigationPath = '';
      }
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
    } else if (uniqueKey === 'showTags') {
      if (this.settingsModalOpen) {
        this.settingsModalOpen = false;
      }
      this.toggleButtonOpposite('showTags');
    } else if (uniqueKey === 'verifyThumbnails') {
      this.verifyThumbnails();
    } else if (uniqueKey === 'rescanDirectory') {
      this.rescanDirectory();
    } else if (uniqueKey === 'regenerateLibrary') {
      this.regenerateLibrary();
    } else if (uniqueKey === 'playPlaylist') {
      this.electronService.ipcRenderer.send('please-create-playlist', this.pipeSideEffectService.galleryShowing);
    } else if (uniqueKey === 'showTagTray') {
      if (this.settingsButtons.showRelatedVideosTray.toggled) {
        this.settingsButtons.showRelatedVideosTray.toggled = false;
      }
      if (this.settingsButtons.showTagTray.toggled) {
        this.closeTagsTray();
      } else {
        this.settingsButtons.showTagTray.toggled = true;
      }
    } else if (uniqueKey === 'showRelatedVideosTray') {
      if (this.settingsButtons.showTagTray.toggled) {
        this.settingsButtons.showTagTray.toggled = false;
      }
      this.settingsButtons.showRelatedVideosTray.toggled = !this.settingsButtons.showRelatedVideosTray.toggled;
      this.computePreviewWidth();
    } else if (uniqueKey === 'sortOrder') {
      this.toggleButtonOpposite(uniqueKey);
      setTimeout(() => {
        if (this.sortFilterElement) { // just in case, perform check
          this.sortFilterElement.nativeElement.value = this.sortType;
        }
      });
    } else if (uniqueKey === 'shuffleGalleryNow') {
      this.sortType = 'random';
      this.shuffleTheViewNow++;
      this.scrollToTop();
      // if sort filter is NOT showin on the sidebar, enable
      if (!this.sortFilterElement) {
        this.settingsButtons['sortOrder'].toggled = true;
      }
      // and set the setting-option to `Random' after timeout to update view
      setTimeout(() => {
        if (this.sortFilterElement) { // just in case, perform check
          const allOptions = this.sortFilterElement.nativeElement.options;
          allOptions[allOptions.length - 1].selected = true;
        }
      });
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
    if (!fromIpc) {
      this.electronService.ipcRenderer.send('app-to-touchBar', uniqueKey);
    } else {
      this.cd.detectChanges();
    }
  }

  public showSettingsGroup(group: number): void {
    this.settingToShow = group;
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
      clipHeight: 144, // default = half the screenshot height
      clipSnippetLength: 1,
      clipSnippets: 5,
      extractClips: false,
      futureHubName: '',
      listOfFiles: [],
      screensPerVideo: true,
      screenshotSizeForImport: 288, // default
      selectedOutputFolder: '',
      selectedSourceFolder: '',
      showWizard: true,
      ssConstant: 10,
      ssVariable: 10,
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
    if (this.rootFolderLive) {
      this.progressNum1 = 0;
      this.importStage = 'importingMeta';
      if (this.settingsModalOpen) {
        this.toggleSettings();
      }
      this.electronService.ipcRenderer.send('only-import-new-files', this.finalArray);
    } else {
      this.notifyRootFolderNotLive();
    }
  }

  /**
   * Verify all files have thumbnails
   */
  public verifyThumbnails(): void {
    if (this.rootFolderLive) {
      this.progressNum1 = 0;
      this.importStage = 'importingScreenshots';
      this.toggleSettings();
      this.electronService.ipcRenderer.send('verify-thumbnails', this.finalArray);
    } else {
      this.notifyRootFolderNotLive();
    }
  }

  /**
   * Rescan the current input directory
   */
  public rescanDirectory(): void {
    if (this.rootFolderLive) {
      this.progressNum1 = 0;
      this.importStage = 'importingMeta';
      if (this.settingsModalOpen) {
        this.toggleSettings();
      }
      this.electronService.ipcRenderer.send('rescan-current-directory', this.finalArray);
    } else {
      this.notifyRootFolderNotLive();
    }
  }

  /**
   * Regenerate the library
   */
  public regenerateLibrary(): void {
    if (this.rootFolderLive) {
      this.progressNum1 = 0;
      this.importStage = 'importingMeta';
      this.toggleSettings();
      this.electronService.ipcRenderer.send('regenerate-library', this.finalArray);
    } else {
      this.notifyRootFolderNotLive();
    }
  }

  /**
   * Notify user root folder is not live
   */
  notifyRootFolderNotLive(): void {
    this.folderNotConnectedErrorShowing = true;
    setTimeout(() => {
      this.folderNotConnectedErrorShowing = false;
    }, 1500);
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
    // Subtract 14 -- it is a bit more than the scrollbar on the right
    this.galleryWidth = document.getElementById('scrollDiv').getBoundingClientRect().width - 14;

    if (
      this.appState.currentView === 'showClips'
      || this.appState.currentView === 'showThumbnails'
      || this.appState.currentView === 'showDetails'
    ) {
      const margin: number = (this.settingsButtons['compactView'].toggled ? 4 : 40);
      this.previewWidth = (this.galleryWidth / this.currentImgsPerRow) - margin;

      // used in details view only
      this.detailsMaxWidth = this.galleryWidth - this.previewWidth - 40; // 40px is just an estimate here

    } else if (
      this.appState.currentView === 'showFilmstrip'
      || this.appState.currentView === 'showFullView'
    ) {
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

    switch (this.appState.currentView) {
      case 'showThumbnails':
        if (this.settingsButtons.compactView.toggled) {
          this.textPaddingHeight = 0;
        } else if (this.settingsButtons.showMoreInfo.toggled) {
          this.textPaddingHeight = 55;
        } else {
          this.textPaddingHeight = 20;
        }
        break;

      case 'showFilmstrip':
        if (this.settingsButtons.showMoreInfo.toggled) {
          this.textPaddingHeight = 20;
        } else {
          this.textPaddingHeight = 0;
        }
        break;

      case 'showFiles':
        this.textPaddingHeight = 20;
        break;

      case 'showClips':
        if (this.settingsButtons.compactView.toggled) {
          this.textPaddingHeight = 0;
        } else if (this.settingsButtons.showMoreInfo.toggled) {
          this.textPaddingHeight = 55;
        } else {
          this.textPaddingHeight = 20;
        }
        break;

      // default case not needed
    }
  }

  /**
   * Add search string to filter array
   * When user presses the `ENTER` key
   * @param value  -- the string to filter
   * @param origin -- number in filter array of the filter to target
   */
  onEnterKey(value: string, origin: number): void {
    const trimmed = value.trim();

    if (origin === 6) {
      // the `tags include` search
      this.tagTypeAhead = '';
    }

    if (trimmed) {
      // don't include duplicates
      if (!this.filters[origin].array.includes(trimmed)) {
        this.filters[origin].array.push(trimmed);
        this.filters[origin].bool = !this.filters[origin].bool;
        this.filters[origin].string = '';
        this.scrollToTop();
      }
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
   * @param pxHeightForImport - string of number of pixels for the height of each screenshot
   */
  selectScreenshotSize(pxHeightForImport: '144' | '216' | '288' | '360' | '432' | '504'): void {
    const height: AllowedScreenshotHeight = parseInt(pxHeightForImport, 10) as AllowedScreenshotHeight;
    this.wizard.screenshotSizeForImport = height;
  }

  /**
   * Called on screenshot size dropdown select
   * @param pxHeightForImport - string of number of pixels for the height of each screenshot
   */
  selectClipSize(pxHeightForImport: '144' | '216' | '288' | '360' | '432' | '504'): void {
    const height: AllowedScreenshotHeight = parseInt(pxHeightForImport, 10) as AllowedScreenshotHeight;
    this.wizard.clipHeight = height;
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
    return (objectKeys);
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
        this.appState.currentZoomLevel = 1;             // TODO -- remove whole block -- not needed any more !?!?!?!??!?! -----------------!
      }
      if (!settingsObject.appState.imgsPerRow) {
        this.appState.imgsPerRow = defaultImgsPerRow;
      }
    }
    this.sortType = this.appState.currentSort;
    this.imgsPerRow = this.appState.imgsPerRow;
    this.currentImgsPerRow = this.imgsPerRow[this.appState.currentView];
    this.grabAllSettingsKeys().forEach(element => {
      if (settingsObject.buttonSettings[element]) {
        this.settingsButtons[element].toggled = settingsObject.buttonSettings[element].toggled;
        this.settingsButtons[element].hidden = settingsObject.buttonSettings[element].hidden;
        // retrieving state of buttons for touchBar
        if (this.settingsButtons[element].toggled) {
          this.electronService.ipcRenderer.send('app-to-touchBar', element);
        }
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

  /**
   * Handle right-click and `Show similar`
   */
  showSimilarNow(): void {
    this.findMostSimilar = this.currentRightClickedItem.cleanName;
    // console.log(this.findMostSimilar);
    this.showSimilar = true;
  }

  /**
   * handle right-click and `Open folder`
   * Code similar to `openVideo()`
   */
  openContainingFolderNow(): void {
    this.fullPathToCurrentFile = path.join(
      this.appState.selectedSourceFolder,
      this.currentRightClickedItem.partialPath,
      this.currentRightClickedItem.fileName
    );

    this.openInExplorer();
  }

  /**
   * Handle right-click on file and `view folder`
   */
  showOnlyThisFolderNow(): void {
    this.handleFolderWordClicked(this.currentRightClickedItem.partialPath);
  }

  rightMouseClicked(event: MouseEvent, item: ImageElement): void {
    const winWidth: number = window.innerWidth;
    const clientX: number = event.clientX;
    const howFarFromRight: number = winWidth - clientX;

    // handle top-offset if clicking close to the bottom
    const winHeight: number = window.innerHeight;
    const clientY: number = event.clientY;
    const howFarFromBottom: number = winHeight - clientY;

    this.rightClickPosition.x = (howFarFromRight < 150) ? clientX - 150 + (howFarFromRight) : clientX;
    this.rightClickPosition.y = (howFarFromBottom < 190) ? clientY - 190 + (howFarFromBottom) : clientY;

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
   * Deletes a file (moves to recycling bin / trash)
   */
  deleteThisFile(item: ImageElement): void {
    this.electronService.ipcRenderer.send('delete-video-file', item);
  }

  /**
   * Close the thumbnail sheet
   */
  closeSheetOverlay() {
    this.sheetOverlayShowing = false;
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
  }

  /**
   * Close the rename dialog
   */
  closeRename() {
    this.renamingNow = false;
    this.cd.detectChanges();
  }

  /**
   * Searches through the `finalArray` and updates the file name and display name
   * Should not error out if two files have the same name
   */
  replaceFileNameInFinalArray(renameTo: string, oldFileName: string, index: number): void {

    if (this.finalArray[index].fileName === oldFileName) {
      this.finalArray[index].fileName = renameTo;
      this.finalArray[index].cleanName = renameTo.slice().substr(0, renameTo.lastIndexOf('.'));
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
        this.translate.setTranslation('ru', Russian);
        this.appState.language = 'ru';
        break;
      case 'fr':
        this.translate.use('fr');
        this.translate.setTranslation('fr', French);
        this.appState.language = 'fr';
        break;
      case 'pt':
        this.translate.use('pt');
        this.translate.setTranslation('pt', Portuguese);
        this.appState.language = 'pt';
        break;
      case 'de':
        this.translate.use('de');
        this.translate.setTranslation('de', German);
        this.appState.language = 'de';
        break;
      case 'es':
        this.translate.use('es');
        this.translate.setTranslation('es', Spanish);
        this.appState.language = 'es';
        break;
      case 'ar':
        this.translate.use('ar');
        this.translate.setTranslation('ar', Arabic);
        this.appState.language = 'ar';
        break;
      case 'bn':
        this.translate.use('bn');
        this.translate.setTranslation('bn', Bengali);
        this.appState.language = 'bn';
        break;
      case 'it':
        this.translate.use('it');
        this.translate.setTranslation('it', Italian);
        this.appState.language = 'it';
        break;
      case 'hi':
        this.translate.use('hi');
        this.translate.setTranslation('hi', Hindi);
        this.appState.language = 'hi';
        break;
      case 'zh':
        this.translate.use('zh');
        this.translate.setTranslation('zh', Chinese);
        this.appState.language = 'zh';
        break;
      case 'ja':
        this.translate.use('ja');
        this.translate.setTranslation('ja', Japanese);
        this.appState.language = 'ja';
        break;
      case 'ko':
        this.translate.use('ko');
        this.translate.setTranslation('ko', Korean);
        this.appState.language = 'ko';
        break;
      case 'ms':
        this.translate.use('ms');
        this.translate.setTranslation('ms', Malay);
        this.appState.language = 'ms';
        break;
      case 'uk':
        this.translate.use('uk');
        this.translate.setTranslation('uk', Ukrainian);
        this.appState.language = 'uk';
        break;
      default:
        this.translate.use('en');
        this.translate.setTranslation('en', English);
        this.appState.language = 'en';
        break;
    }

    this.updateSystemMessages();
  }

  /**
   * Update the systemMessages `main.ts`
   * so that ... i18n everywhere!
   */
  updateSystemMessages() {
    const newMessages = {};

    for (const key in English.SYSTEM) {
      if (English.SYSTEM[key]) {
        newMessages[key] = this.translate.instant('SYSTEM.' + key);
      }
    }

    this.electronService.ipcRenderer.send(
      'system-messages-updated', newMessages
    );
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
    const position: number = emission.index;

    if (emission.type === 'add') {
      if (this.finalArray[position].tags) {
        this.finalArray[position].tags.push(emission.tag);
      } else {
        this.finalArray[position].tags = [emission.tag];
      }
    } else {
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
   * Update FinalArray with the default screenshot for some element
   * @param emission
   */
  editDefaultScreenshot(emission: DefaultScreenEmission): void {
    const position: number = emission.index;
    this.finalArray[position].defaultScreen = emission.defaultScreen;
    this.finalArrayNeedsSaving = true;
  }

  /**
   * Select a particular sort order (star rating, number of times played, etc)
   * @param type
   */
  selectFilterOrder(type: SortType): void {
    this.sortType = type;
    this.appState.currentSort = type;
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
   *   cutoff may be the max number if the other computation returns a number too high
   * @param someArray
   */
  getOutlierCutoff(someArray: number[]): number {
    const values = someArray.slice();
    const max = Math.max(...values);
    values.sort((a, b) => { return a - b; });

    const q1 = values[Math.floor((values.length / 4))];
    const q3 = values[Math.ceil((values.length * (3 / 4)))];
    const iqr = q3 - q1;

    return Math.min((q3 + iqr * 3), max);
  }

  addTagToManyVideos(tag: string): void {
    this.finalArray.forEach((element: ImageElement) => {
      if (element.selected) {
        if (!element.tags || !element.tags.includes(tag)) {

          this.manualTagsService.addTag(tag); // only updates the count in the tray, nothing else!

          this.editFinalArrayTag({
            type: 'add',
            index: element.index,
            tag: tag
          });
        }

      }
    });

    if (this.appState.currentView === 'showDetails') {
      // details view shows tags but they don't update without some code that forces a refresh :(
      // hack-y code simply hides manual tags and then shows them again
      this.settingsButtons.manualTags.toggled = !this.settingsButtons.manualTags.toggled;
      this.cd.detectChanges();
      this.settingsButtons.manualTags.toggled = !this.settingsButtons.manualTags.toggled;
    }
  }

  /**
   * Close the manual tags tray at the bottom
   * exit batch mode if it is active
   */
  closeTagsTray(): void {
    this.settingsButtons['showTagTray'].toggled = false;
    if (this.batchTaggingMode) {
      this.toggleBatchTaggingMode();
    }
  }

  /**
   * Toggle between batch tag edit mode and normal mode
   */
  toggleBatchTaggingMode(): void {
    if (this.batchTaggingMode) {
      this.finalArray.forEach((element: ImageElement) => {
        element.selected = false;
      });
    }
    this.batchTaggingMode = !this.batchTaggingMode
  }

}
