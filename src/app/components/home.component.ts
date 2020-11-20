import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as path from 'path';

import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { VirtualScrollerComponent } from 'ngx-virtual-scroller';

// Services
import { AutoTagsSaveService } from './tags-auto/tags-save.service';
import { ElectronService } from '../providers/electron.service';
import { FilePathService } from './views/file-path.service';
import { ImageElementService } from '../services/image-element.service';
import { ManualTagsService } from './tags-manual/manual-tags.service';
import { ModalService } from './modal/modal.service';
import { PipeSideEffectService } from '../pipes/pipe-side-effect.service';
import { ResolutionFilterService } from '../pipes/resolution-filter.service';
import { ShortcutsService, CustomShortcutAction } from './shortcuts/shortcuts.service';
import { SourceFolderService } from './statistics/source-folder.service';
import { StarFilterService } from '../pipes/star-filter.service';
import { StarRatingService } from '../pipes/star-rating.service';
import { WordFrequencyService, WordFreqAndHeight } from '../pipes/word-frequency.service';

// Components
import { SortOrderComponent } from './sort-order/sort-order.component';

// Interfaces
import { FinalObject, ImageElement, ScreenshotSettings, ResolutionString, StarRating } from '../../../interfaces/final-object.interface';
import { ImportStage } from '../../../node/main-support';
import { SettingsObject } from '../../../interfaces/settings-object.interface';
import { SortType } from '../pipes/sorting.pipe';
import { WizardOptions } from '../../../interfaces/wizard-options.interface';
import {
  AllSupportedBottomTrayViews,
  AllSupportedViews,
  HistoryItem,
  RenameFileResponse,
  SupportedTrayView,
  SupportedView,
  VideoClickEmit,
} from '../../../interfaces/shared-interfaces';

// Constants, etc
import { AppState, SupportedLanguage, DefaultImagesPerRow, RowNumbers } from '../common/app-state';
import { Filters, filterKeyToIndex, FilterKeyNames } from '../common/filters';
import { GLOBALS } from '../../../node/main-globals';
import { LanguageLookup } from '../common/languages';
import { SettingsButtons, SettingsButtonsGroups, SettingsButtonKey, SettingsButtonsType } from '../common/settings-buttons';

// Animations
import {
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

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: [
    './layout.scss',
    './settings.scss',
    './buttons.scss',
    './search.scss',
    './search-input.scss',
    '../fonts/icons.scss',
    './gallery.scss',
    './wizard-button.scss',
    './resolution.scss',
    './rightclick.scss'
  ],
  animations: [
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

  @ViewChild('fuzzySearch', { static: false }) fuzzySearch: ElementRef;
  @ViewChild('magicSearch', { static: false }) magicSearch: ElementRef;
  @ViewChild('searchRef', { static: false }) searchRef: ElementRef;

  @ViewChild(SortOrderComponent) sortOrderRef: SortOrderComponent;

  @ViewChild(VirtualScrollerComponent, { static: false }) virtualScroller: VirtualScrollerComponent;

  defaultSettingsButtons = JSON.parse(JSON.stringify(SettingsButtons));
  settingsButtons: SettingsButtonsType = SettingsButtons;
  settingsButtonsGroups = SettingsButtonsGroups;
  settingTabToShow = 0;

  filters = Filters;

  // App state to save -- so it can be exported and saved when closing the app
  appState = AppState;

  demo = GLOBALS.demo;
  macVersion = GLOBALS.macVersion;
  versionNumber = GLOBALS.version;

  vhaFileHistory: HistoryItem[] = [];

  windowResizeTimeout = null;

  newVideoImportTimeout = null;
  newVideoImportCounter: number = 0;

  // ========================================================================
  // App state / UI state
  // ------------------------------------------------------------------------

  isClosing = false;
  appMaximized = false;
  settingsModalOpen = false;
  flickerReduceOverlay = true;
  isFirstRunEver = false;
  rootFolderLive: boolean = true; // set to `false` when loading hub but video folder is not connected

  // ========================================================================
  // Import / extraction progress
  // ------------------------------------------------------------------------

  extractionPercent: number = 1;
  importStage: ImportStage = 'done';
  progressString = '';

  // ========================================================================
  // Gallery thumbnails
  // ------------------------------------------------------------------------

  currentImgsPerRow: number = 5;
  galleryWidth: number;
  imgsPerRow: RowNumbers = DefaultImagesPerRow;
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
  // Size filter
  // ------------------------------------------------------------------------

  sizeLeftBound: number = 0;
  sizeRightBound: number = Infinity;

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

  // ========================================================================
  // Right-click / Renaming functionality
  // ------------------------------------------------------------------------

  currentRightClickedItem: ImageElement;
  renamingExtension: string;
  renamingNow: boolean = false;
  rightClickPosition: { x: number, y: number } = { x: 0, y: 0 };
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
    isFixedNumberOfScreenshots: true,
    screenshotSizeForImport: 288,
    selectedOutputFolder: '',
    selectedSourceFolder: { 0: { path: '', watch: false }},
    showWizard: false,
    ssConstant: 10,
    ssVariable: 5,
  };

  // ========================================================================
  // currently only used for the statistics page
  // && to prevent clip view from showing when no clips extracted
  // defaults set here ONLY because when starting the app in clip view
  // the app would show error in console log:
  //   `Cannot read property 'clipSnippets' of undefined`
  // ------------------------------------------------------------------------

  currentScreenshotSettings: ScreenshotSettings = {
    clipHeight: 144,
    clipSnippetLength: 1,
    clipSnippets: 0,
    fixed: true,
    height: 432,
    n: 3,
  };

  // ========================================================================
  // Miscellaneous variables
  // ------------------------------------------------------------------------

  currentClickedItemName = '';
  currentPlayingFolder = '';
  currentStarRating: StarRating;
  currentIndex = 0;
  fullPathToCurrentFile = '';

  fuzzySearchString = '';
  magicSearchString = '';
  regexSearchString = '';
  regexError = false; // handle pipe-side-effect BehaviorSubject

  wordFreqArr: WordFreqAndHeight[];
  numberOfVideosFound: number; // after applying all search filters

  findMostSimilar: string; // for finding similar files to this one
  showSimilar: boolean = false; // to toggle the similarity pipe

  shuffleTheViewNow = 0; // dummy number to force re-shuffle current view

  sortType: SortType = 'default';

  durationOutlierCutoff: number = 0; // for the duration filter to cut off outliers
  sizeOutlierCutoff: number = 0; // for the size filter to cut off outliers

  timeExtractionStarted;   // time remaining calculator
  timeExtractionRemaining; // time remaining calculator

  deletePipeHack: boolean = false; // to force deletePipe to update

  folderNavigationScrollOffset: number = 0; // when in folder view and returning back to root
  folderViewNavigationPath: string = '';

  batchTaggingMode = false; // when batch tagging is enabled

  latestVersionAvailable: string;

  tagTypeAhead: string = '';

  allFinishedScanning: boolean = true;

  lastRenamedFileHack: ImageElement;

  // Behavior Subjects for IPC events:

  inputSorceChosenBehaviorSubject: BehaviorSubject<string> = new BehaviorSubject(undefined);
  numberScreenshotsDeletedBehaviorSubject: BehaviorSubject<number> = new BehaviorSubject(undefined);
  oldFolderReconnectedBehaviorSubject: BehaviorSubject<{source: number, path: string}> = new BehaviorSubject(undefined);
  renameFileResponseBehaviorSubject: BehaviorSubject<RenameFileResponse> = new BehaviorSubject(undefined);

  // ========================================================================
  // \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/
  // ========================================================================


  // Listen for key presses
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // .metaKey is for mac `command` button
    if (event.ctrlKey === true || event.metaKey) {

      const key: string = event.key;

      if (this.shortcutService.keyToActionMap.has(key)) {
        const shortcutAction: SettingsButtonKey | CustomShortcutAction = this.shortcutService.keyToActionMap.get(key);

        if (this.shortcutService.regularShortcuts.includes(shortcutAction as SettingsButtonKey)) {
          this.toggleButton(shortcutAction as SettingsButtonKey);
        } else {
          this.handleCustomShortcutAction(event, shortcutAction as CustomShortcutAction);
        }
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
    private http: HttpClient,
    public autoTagsSaveService: AutoTagsSaveService,
    public cd: ChangeDetectorRef,
    public electronService: ElectronService,
    public filePathService: FilePathService,
    public imageElementService: ImageElementService,
    public manualTagsService: ManualTagsService,
    public modalService: ModalService,
    public pipeSideEffectService: PipeSideEffectService,
    public resolutionFilterService: ResolutionFilterService,
    public shortcutService: ShortcutsService,
    public sourceFolderService: SourceFolderService,
    public starFilterService: StarFilterService,
    public starRatingService: StarRatingService,
    public translate: TranslateService,
    public wordFrequencyService: WordFrequencyService,
    public zone: NgZone,
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang('en');
    this.changeLanguage('en');

    // this.modalService.openWelcomeMessage(); // WIP

    setTimeout(() => {
      this.wordFrequencyService.finalMapBehaviorSubject.subscribe((value: WordFreqAndHeight[]) => {
        this.wordFreqArr = value;
      });
      this.resolutionFilterService.finalResolutionMapBehaviorSubject.subscribe((value) => {
        this.resolutionFreqArr = value;
        this.cd.detectChanges(); // prevent `ExpressionChangedAfterItHasBeenCheckedError`
      });
      this.starFilterService.finalStarMapBehaviorSubject.subscribe((value) => {
        this.starRatingFreqArr = value;
        this.cd.detectChanges(); // prevent `ExpressionChangedAfterItHasBeenCheckedError`
      });
      this.pipeSideEffectService.searchResults.subscribe((value: number) => {
        this.numberOfVideosFound = value;
        this.cd.detectChanges(); // prevent `ExpressionChangedAfterItHasBeenCheckedError`
      });
      this.pipeSideEffectService.regexError.subscribe((value: boolean) => {
        this.regexError = value;
      });

    }, 100);

    // for statistics.component
    this.electronService.ipcRenderer.on('number-of-screenshots-deleted', (event, totalDeleted: number) => {
      this.numberScreenshotsDeletedBehaviorSubject.next(totalDeleted);
      this.numberScreenshotsDeletedBehaviorSubject.next(undefined); // allways remove right away
    });

    // for statistics.component
    this.electronService.ipcRenderer.on('old-folder-reconnected', (event, sourceIndex: number, newPath: string) => {
      this.oldFolderReconnectedBehaviorSubject.next({ source: sourceIndex, path: newPath });
      this.oldFolderReconnectedBehaviorSubject.next(undefined); // allways remove right away
    });

    // Returning Input
    this.electronService.ipcRenderer.on('input-folder-chosen', (event, filePath) => {
      // if this happens when CURRENT HUB is open
      this.inputSorceChosenBehaviorSubject.next(filePath);
      this.inputSorceChosenBehaviorSubject.next(undefined); // allways remove right away

      // if this happens during WIZARD stage
      this.wizard.selectedSourceFolder[0].path = filePath;
      this.wizard.selectedOutputFolder = filePath;
      this.cd.detectChanges();
    });

    // Returning Output
    this.electronService.ipcRenderer.on('output-folder-chosen', (event, filePath) => {
      this.wizard.selectedOutputFolder = filePath;
      this.cd.detectChanges();
    });

    // Happens if a file with the same hub name already exists in the directory
    this.electronService.ipcRenderer.on('please-fix-hub-name', (event) => {
      this.importStage = 'done';
      this.cd.detectChanges();
    });

    // Generic messaging from Node
    this.electronService.ipcRenderer.on('show-msg-dialog', (event,  title: string, content: string, details: string ) => {
      this.zone.run(() => {
        this.modalService.openDialog(title, content, details);
      });
    });

    // When clicking to open a file and it turns out no longer present there
    this.electronService.ipcRenderer.on('file-not-found', (event) => {
      this.zone.run(() => {
        this.modalService.openSnackbar(this.translate.instant('SETTINGS.fileNotFound'));
      });
    });

    // Closing of Window was issued by Electron
    this.electronService.remote.getCurrentWindow().on('close', () => {
      // Check to see if this was not originally triggered by Title-Bar to avoid double saving of settings
      if (!this.isClosing) {
        this.initiateClose();
      }
    });

    // When Node succeeds or fails to rename a file that Angular requested to rename
    this.electronService.ipcRenderer.on(
      'rename-file-response', (
          event,
          index: number,
          success: boolean,
          renameTo: string,
          oldFileName: string,
          errMsg?: string
        ) => {

          this.renameFileResponseBehaviorSubject.next({
            index: index,
            success: success,
            renameTo: renameTo,
            oldFileName: oldFileName,
            errMsg: errMsg,
          });
          this.renameFileResponseBehaviorSubject.next(undefined); // allways remove right away

          if (success) {
            // Update the final array, close rename dialog if open
            // the error messaging is handled by `rename-file.component` or `meta.component` if it happens
            this.imageElementService.replaceFileNameInFinalArray(renameTo, oldFileName, index);
            this.closeRename();

            // if successful rename, and `watch` directory enabled, this video might appear twice
            // use `lastRenamedFileHack` to prevent it!
            const renamedFile: ImageElement = this.imageElementService.imageElements[index];
            console.log('Rename success:');
            console.log(renamedFile);
            this.lastRenamedFileHack = renamedFile;
          }

    });

    // happens when user replaced a thumbnail and process is done
    this.electronService.ipcRenderer.on('thumbnail-replaced', (event) => {
      this.electronService.webFrame.clearCache();
    });

    this.electronService.ipcRenderer.on('touchBar-to-app', (event, changesFromTouchBar: SettingsButtonKey | SupportedView) => {
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
    this.electronService.ipcRenderer.on('os-dark-mode-change', (event, desiredMode: string) => {

      const darkModeOn: boolean = this.settingsButtons['darkMode'].toggled;

      if (darkModeOn && desiredMode === 'light') {
        this.toggleButton('darkMode');
        this.cd.detectChanges();
      } else if (!darkModeOn && desiredMode === 'dark') {
        this.toggleButton('darkMode');
        this.cd.detectChanges();
      }
    });

    // TODO -- update 'source connected' thingy
    this.electronService.ipcRenderer.on('directory-now-connected', (event, sourceIndex: number, sourcePath: string) => {
      console.log('FOLDER NOT CONNECTED !!!');
      console.log(sourceIndex, sourcePath);

      // TODO -- if this error never happens, all is well; remove the `sourcePath` from this method :)
      if (this.sourceFolderService.selectedSourceFolder[sourceIndex].path !== sourcePath) {
        console.log('WARNING HUGE ERROR HERE !!!!!! MUST NEVER HAPPEN !!!');
      }

      this.sourceFolderService.sourceFolderConnected[sourceIndex] = true;
      console.log(this.sourceFolderService.sourceFolderConnected);
    });

    this.electronService.ipcRenderer.on('started-watching-this-dir', (event, sourceIndex: number) => {
      this.allFinishedScanning = false;
      this.sourceFolderService.addCurrentScanning(sourceIndex);
    });

    // WIP -- delete any videos no longer found on the hard drive!
    this.electronService.ipcRenderer.on('all-files-found-in-dir', (event, sourceIndex: number, allFilesMap: Map<string, 1>) => {
      console.log('all files returning:');
      console.log(sourceIndex, typeof(sourceIndex));
      console.log(allFilesMap);

      this.sourceFolderService.removeCurrentScanning(sourceIndex);

      this.allFinishedScanning = this.sourceFolderService.areAllFinishedScanning();
      if (this.allFinishedScanning) {
        console.log('DONE SCANNING !!!!!!!');
        this.cd.detectChanges();
      }

      const rootFolder: string = this.sourceFolderService.selectedSourceFolder[sourceIndex].path;

      let somethingDeleted: boolean = false;

      this.imageElementService.imageElements
        .filter((element: ImageElement) => { return element.inputSource == sourceIndex; })
        // notice the loosey-goosey comparison! this is because number  ^^  string comparison happening here!
        .forEach((element: ImageElement) => {
          console.log(element.fileName);
          if (!allFilesMap.has(path.join(rootFolder, element.partialPath, element.fileName))) {
            console.log('deleting');
            element.deleted = true;
            somethingDeleted = true;
          }
        });

      if (somethingDeleted) {
        this.deletePipeHack = !this.deletePipeHack;
      }

    });

    // When `watch` folder and `chokidar` detects a file was deleted (can happen when renamed too!)
    this.electronService.ipcRenderer.on('single-file-deleted', (event, sourceIndex: number, partialPath: string) => {
      this.imageElementService.imageElements
        .filter((element: ImageElement) => { return element.inputSource == sourceIndex; })
        // notice the loosey-goosey comparison! this is because number  ^^  string comparison happening here!
        .forEach((element: ImageElement) => {
          if (('\\' + partialPath) === path.join(element.partialPath, element.fileName)) {
            console.log('FILE DELETED !!!', partialPath);
            element.deleted = true;
            this.deletePipeHack = !this.deletePipeHack;
          }
        });
    });

    /**
     * Update thumbnail extraction progress when node sends update
     * @param current - the current number that finished extracting
     * @param total   - the total number of files to be extracted
     * @param stage   - `ImportStage` type
     */
    this.electronService.ipcRenderer.on('import-progress-update', (
      event,
      current: number,
      total: number,
      stage: ImportStage
    ) => {

      this.importStage = stage;

      if (this.isFirstRunEver) {
        this.showFirstRunMessage();
      }

      if (current === 1) {
        this.timeExtractionStarted = new Date().getTime();
      }

      if (current > 3) {
        const thisInstant = new Date().getTime();
        const timeElapsed = thisInstant - this.timeExtractionStarted;
        this.timeExtractionRemaining = Math.round((total - current) * (timeElapsed / current) / 1000); // convert MS to seconds
        if (this.timeExtractionRemaining < 1) {
          this.timeExtractionRemaining = 0;
        }
      }

      const percentProgress: number = Math.round(100 * current / total);
      this.progressString = 'loading - ' + percentProgress + '%';
      this.extractionPercent = percentProgress;

      this.cd.detectChanges(); // seems needed to update the donut
    });

    // Final object returns
    this.electronService.ipcRenderer.on('final-object-returning', (
      event,
      finalObject: FinalObject,
      pathToFile: string,
      outputFolderPath: string,
    ) => {

      this.lastRenamedFileHack = undefined;

      this.imageElementService.recentlyPlayed = [];

      this.currentScreenshotSettings = finalObject.screenshotSettings;

      this.rootFolderLive = true; // TODO -- do away with this once many root folders supported
      this.imageElementService.finalArrayNeedsSaving = false; // TODO -- remove; used to be for hadling root folder change

      this.appState.currentVhaFile = pathToFile;
      this.appState.selectedOutputFolder = outputFolderPath;

      this.appState.hubName = finalObject.hubName;
      this.appState.numOfFolders = finalObject.numOfFolders;

      this.sourceFolderService.selectedSourceFolder = finalObject.inputDirs;
      this.sourceFolderService.resetConnected();

      console.log('input dirs', finalObject.inputDirs);

      // Update history of opened files
      this.updateVhaFileHistory(pathToFile, finalObject.hubName);

      this.folderViewNavigationPath = '';

      this.manualTagsService.removeAllTags();
      this.setTags(finalObject.addTags, finalObject.removeTags);
      this.manualTagsService.populateManualTagsService(finalObject.images);

      this.imageElementService.imageElements = this.demo ? finalObject.images.slice(0, 50) : finalObject.images;

      this.canCloseWizard = true;
      this.wizard.showWizard = false;
      this.flickerReduceOverlay = false;

      this.setUpDurationFilterValues(this.imageElementService.imageElements);
      this.setUpSizeFilterValues(this.imageElementService.imageElements);

      if (this.sortOrderRef.sortFilterElement) {
        this.sortOrderRef.sortFilterElement.nativeElement.value = this.sortType;
      }

      this.cd.detectChanges();
    });

    // If no previously saved settings exist, this gets sent over
    this.electronService.ipcRenderer.on('set-language-based-off-system-locale', (event, localeString: string) => {
      if (localeString) {
        this.setOrRestoreLanguage(undefined, localeString);
      }
    });

    // Returning settings
    this.electronService.ipcRenderer.on('settings-returning', (
      event,
      settingsObject: SettingsObject,
      locale: string
    ) => {
      this.vhaFileHistory = (settingsObject.vhaFileHistory || []);
      this.restoreSettingsFromBefore(settingsObject);
      this.setOrRestoreLanguage(settingsObject.appState.language, locale);
      if (this.appState.currentZoomLevel !== 1) {
        this.electronService.webFrame.setZoomFactor(this.appState.currentZoomLevel);
      }
      if (settingsObject.appState.currentVhaFile) {
        this.loadThisVhaFile(settingsObject.appState.currentVhaFile);
      } else {
        this.wizard.showWizard = true;
        this.flickerReduceOverlay = false;
      }
      if (settingsObject.shortcuts) {
        this.shortcutService.initializeFromSaved(settingsObject.shortcuts);
      }
    });

    this.electronService.ipcRenderer.on('please-open-wizard', (event, firstRun) => {
      // Correlated with the first time ever starting the app !!!
      // Can happen when no settings present
      // Can happen when trying to open a .vha2 file that no longer exists
      if (firstRun) {
        this.firstRunLogic();
      }
      this.wizard.showWizard = true;
      this.flickerReduceOverlay = false;
    });

    // This happens when the computer is about to SHUT DOWN
    this.electronService.ipcRenderer.on('please-shut-down-ASAP', (event) => {
      this.initiateClose();
    });

    // gets called if `trash` successfully removed the file
    this.electronService.ipcRenderer.on('file-deleted', (event, element: ImageElement) => {
      // spot check it's the same element
      // just in case the message comes back after user has switched to view another hub
      if (element.fileName === this.imageElementService.imageElements[element.index].fileName) {
        this.imageElementService.imageElements[element.index].deleted = true;
        this.deletePipeHack = !this.deletePipeHack;
        this.imageElementService.finalArrayNeedsSaving = true;
        this.cd.detectChanges();
      }
    });

    this.electronService.ipcRenderer.on('new-video-meta', (event, element: ImageElement) => {

      if (   this.lastRenamedFileHack // undefined unless file recently renamed
          && this.lastRenamedFileHack.inputSource === element.inputSource
          && this.lastRenamedFileHack.partialPath === element.partialPath
          && this.lastRenamedFileHack.fileName    === element.fileName
      ) {
        // this video was just renamed, skip it
        console.log('SKIPPING THIS -- was just renamed !!!');
        return;
      }

      if (!this.demo || this.imageElementService.imageElements.length <= 50) {
        element.index = this.imageElementService.imageElements.length;
        this.imageElementService.imageElements.push(element); // not enough for view to update; we need `.slice()`
        this.imageElementService.finalArrayNeedsSaving = true;
        this.debounceImport();
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
          this.loadThisVhaFile(fullPath);
        }
      }
    };
  }

  /**
   * Tell Electron to drag a file out of the app into the system
   * Used for dragging videos into video editors like Vgeas and Premiere
   */
  draggingVideoFile(event, item: ImageElement): void {
    event.preventDefault();
    const fullPath = this.filePathService.getPathFromImageElement(item);
    this.electronService.ipcRenderer.send('drag-video-out-of-electron', fullPath);
  }

  /**
   * Only update the view after enough changes occurred
   * - update after every new element when < 20 elements total
   * - update every 20 new elements after until 100; every 100 thereafter
   * - update at most 3 seconds after the last element arrived
   */
  public debounceImport(): void {
    this.newVideoImportCounter++;

    clearTimeout(this.newVideoImportTimeout);

    if (    this.imageElementService.imageElements.length < 20
        || (this.imageElementService.imageElements.length < 100 && this.newVideoImportCounter === 20)
        || this.newVideoImportCounter === 100
    ) {
      this.resetFinalArrayRef();
    } else {
      this.newVideoImportTimeout = setTimeout(() => {
        this.resetFinalArrayRef();
      }, 3000);
    }
  }

  /**
   * Helper method only to be used by `debounceImport()`
   */
  private resetFinalArrayRef(): void {
    this.newVideoImportCounter = 0;
    this.imageElementService.imageElements = this.imageElementService.imageElements.slice();
    this.cd.detectChanges();
  }

  /**
   * Delete from finalArray all the video files with particular source index
   * @param sourceIndex
   */
  deleteInputSourceFiles(sourceIndex: number): void {
    this.imageElementService.imageElements.forEach((element: ImageElement) => {
      if (element.inputSource == sourceIndex) { // TODO -- stop the loosey goosey `==` and figure out `string` vs `number`
        element.deleted = true;
        this.imageElementService.finalArrayNeedsSaving = true;
      }
    });
    this.deletePipeHack = !this.deletePipeHack;
  }

  /**
   * Handle dropping something over an item in the gallery
   * Used to handle dropping a .jpg file to replace preview!
   * @param event         drop event - containing path to possible jpg file
   * @param galleryItem   item in the gallery over which jpg was dropped
   */
  droppedSomethingOverVideo(event, galleryItem: ImageElement) {

    // this occurs when a tag is dropped on a video from the tag tray
    if (event.dataTransfer.getData('text')) {
      // tag previously set by `dragStart` in `view-tags.component`
      const tag: string = event.dataTransfer.getData('text');

      this.addTagToThisElement(tag, galleryItem);

      this.ifShowDetailsViewRefreshTags();

      return;
    }

    const pathToNewImage: string = event.dataTransfer.files[0].path.toLowerCase();
    if (
        (
             pathToNewImage.endsWith('.jpg')
          || pathToNewImage.endsWith('.jpeg')
          || pathToNewImage.endsWith('.png')
        )
        && galleryItem.cleanName !== '*FOLDER*'
    ) {
      this.electronService.ipcRenderer.send('replace-thumbnail', pathToNewImage, galleryItem);
    }
  }

  /**
   * Low-tech debounced window resize
   * @param msDelay - number of milliseconds to debounce; if absent sets to 250ms
   */
  public debounceUpdateMax(msDelay?: number): void {
    // console.log('debouncing');
    const delay = msDelay !== undefined ? msDelay : 250;
    clearTimeout(this.windowResizeTimeout);
    this.windowResizeTimeout = setTimeout(() => {
      // console.log('Virtual scroll refreshed');
      this.virtualScroller.refresh();
      this.computePreviewWidth();
    }, delay);
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
   * triggers function that grabs settings and sends them back with `settings-returning`
   */
  public justStarted(): void {
    this.electronService.ipcRenderer.send('just-started');
  }

  public loadThisVhaFile(fullPath: string): void {
    this.electronService.ipcRenderer.send('load-this-vha-file', fullPath, this.getFinalObjectForSaving());
  }

  public loadFromFile(): void {
    this.electronService.ipcRenderer.send('system-open-file-through-modal');
  }

  public selectSourceDirectory(): void {
    this.electronService.ipcRenderer.send('choose-input');
  }

  public selectOutputDirectory(): void {
    this.electronService.ipcRenderer.send('choose-output');
  }

  public importFresh(): void {
    this.sourceFolderService.selectedSourceFolder = this.wizard.selectedSourceFolder;
    this.appState.selectedOutputFolder = this.wizard.selectedOutputFolder;
    this.electronService.ipcRenderer.send('start-the-import', this.wizard);
  }

  public cancelCurrentImport(): void {
    this.electronService.ipcRenderer.send('cancel-current-import');
    setTimeout(() => {
      this.importStage = 'done';
      this.cd.detectChanges();
    }, 10); // just in case delay
  }

  public initiateMinimize(): void {
    this.electronService.ipcRenderer.send('minimize-window');
  }

  public initiateMaximize(): void {
    if (this.appMaximized === false) {
      this.electronService.ipcRenderer.send('maximize-window');
      this.appMaximized = true;
    } else {
      this.electronService.ipcRenderer.send('un-maximize-window');
      this.appMaximized = false;
    }
  }

  public initiateClose(): void {
    this.isClosing = true;
    this.savePreviousViewSize();
    this.appState.imgsPerRow = this.imgsPerRow;
    this.electronService.ipcRenderer.send('close-window', this.getSettingsForSave(), this.getFinalObjectForSaving());
  }

  /**
   * Returns the finalArray if needed, otherwise returns `null`
   * completely depends on global variable `finalArrayNeedsSaving` or if any tags were added/removed in auto-tag-service
   */
  public getFinalObjectForSaving(): FinalObject {
    if (this.imageElementService.finalArrayNeedsSaving || this.autoTagsSaveService.needToSave()) {
      const propsToReturn: FinalObject = {
        addTags: this.autoTagsSaveService.getAddTags(),
        hubName: this.appState.hubName,
        images: this.imageElementService.imageElements,
        // TODO -- rename `selectedSourceFolder` and make sure to update `finalArrayNeedsSaving` when inputDirs changes
        inputDirs: this.sourceFolderService.selectedSourceFolder,
        numOfFolders: this.appState.numOfFolders,
        removeTags: this.autoTagsSaveService.getRemoveTags(),
        screenshotSettings: this.currentScreenshotSettings,
        version: 3,
      };
      return propsToReturn;
    } else {
      return null;
    }
  }

  /**
   * Handle clicking on an item in the gallery
   *
   * @param eventObject - VideoClickEmit
   * @param item        - ImageElement
   * @param doubleClick - boolean -- happens only on `app-file-item` -- added as a quick hack
   */
  public handleClick(eventObject: VideoClickEmit, item: ImageElement, doubleClick?: boolean) {

    console.log(item);

    if (this.batchTaggingMode) {
      item.selected = !item.selected;

      return;
    }

    if (this.settingsButtons.doubleClickMode.toggled && !(eventObject.doubleClick || doubleClick)) {
      // when double-clicking, this runs twice anyway
      this.assignSelectedFile(item);

      return;
    }

    // ctrl/cmd + click for thumbnail sheet
    if (eventObject.mouseEvent.ctrlKey === true || eventObject.mouseEvent.metaKey) {
      this.openThumbnailSheet(item);
    } else if (this.rootFolderLive) {
      this.openVideo(item, eventObject.thumbIndex);
    }
  }

  /**
   * Open the video with user's default media player
   * or with their preferred media player, if chosen
   *
   * @param item                  clicked ImageElement
   * @param clickedThumbnailIndex an index of the thumbnail clicked
   */
  public openVideo(item: ImageElement, clickedThumbnailIndex?: number): void {
    if (!this.sourceFolderService.sourceFolderConnected[item.inputSource]) {
      console.log('not connected!');
      this.modalService.openSnackbar(this.translate.instant('SETTINGS.rootFolderNotLive'));

      return;
    }

    this.imageElementService.updateNumberOfTimesPlayed(item.index);

    this.currentPlayingFolder = item.partialPath;
    this.currentClickedItemName = item.cleanName;
    this.currentStarRating = item.stars;
    this.currentIndex = item.index;
    const fullPath = this.filePathService.getPathFromImageElement(item);
    this.fullPathToCurrentFile = fullPath;

    if (this.appState.preferredVideoPlayer) {
      const time: number = clickedThumbnailIndex
        ? item.duration / (item.screens + 1) * ((clickedThumbnailIndex) + 1)
        : 0;

      const execPath: string = this.appState.preferredVideoPlayer;

      const finalArgs: string = `${this.getVideoPlayerArgs(execPath, time)} ${this.appState.videoPlayerArgs}`;
      this.electronService.ipcRenderer.send('open-media-file-at-timestamp', execPath, fullPath, finalArgs);
    } else {
      this.electronService.ipcRenderer.send('open-media-file', fullPath);
    }

  }

  /**
   * handle right-click and `Open folder`
   */
  openContainingFolderNow(): void {
    this.fullPathToCurrentFile = this.filePathService.getPathFromImageElement(this.currentRightClickedItem);
    this.openInExplorer();
  }

  /**
   * Determine the required arguments to open video player at particular time
   * @param playerPath  full path to user's preferred video player
   * @param time        time in seconds
   */
  public getVideoPlayerArgs(playerPath: string, time: number): string {
    // if user doesn't want to open at timestamp, don't!
    let args: string = '';

    if (this.settingsButtons['openAtTimestamp'].toggled) {
      if (playerPath.toLowerCase().includes('vlc')) {
        args = '--start-time=' + time.toString();    // in seconds

      } else if (playerPath.toLowerCase().includes('mpc')) {
        args = '/start ' + (1000 * time).toString(); // in milliseconds

      } else if (playerPath.toLowerCase().includes('pot')) {
        args = '/seek=' + time.toString();           // in seconds
      }
    }

    return args;
  }

  public openOnlineHelp(): void {
    this.electronService.ipcRenderer.send('please-open-url', 'https://www.videohubapp.com');
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
    this.electronService.ipcRenderer.send('open-in-explorer', this.fullPathToCurrentFile);
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
  updateVhaFileHistory(pathToVhaFile: string, hubName: string): void {

    const newHistoryItem = {
      vhaFilePath: pathToVhaFile,
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
    this.loadThisVhaFile(this.vhaFileHistory[index].vhaFilePath);
  }

  /**
   * Handle click from html to open a recently-opened VHA file
   * @param index - index of the file from `vhaFileHistory`
   */
  removeFromHistory(index: number): void {
    this.vhaFileHistory.splice(index, 1);
  }

  /**
   * Clear out the recently-viewed history
   */
  clearRecentlyViewedHistory(): void {
    this.vhaFileHistory = [];
    this.electronService.ipcRenderer.send('clear-recent-documents');
  }

  /**
   * Show or hide settings
   */
  toggleSettings(): void {
    this.settingTabToShow = 2;
    this.settingsModalOpen = !this.settingsModalOpen;
  }

  hideWizard(): void {
    this.wizard.showWizard = false;
  }

  /**
   * Handle auto-generated tag clicked: add it to file search filter
   * @param event
   */
  autoTagClicked(event: string): void {
    if (!this.settingsButtons['autoFileTags'].toggled) {
      this.settingsButtons['autoFileTags'].toggled = true;
    }
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
    this.settingsButtons['showDetails2'].toggled = false;
    this.settingsButtons['showFiles'].toggled = false;
    this.settingsButtons['showFilmstrip'].toggled = false;
    this.settingsButtons['showFullView'].toggled = false;
    this.settingsButtons['showThumbnails'].toggled = false;
  }

  /**
   * Toggles all TRAY views buttons off
   * A helper function for `toggleBotton`
   */
  toggleAllTrayViewsButtonsOff(): void {
    this.settingsButtons['showFreq'].toggled = false;
    this.settingsButtons['showRecentlyPlayed'].toggled = false;
    this.settingsButtons['showRelatedVideosTray'].toggled = false;
    this.settingsButtons['showTagTray'].toggled = false;
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
    this.currentImgsPerRow = this.imgsPerRow[view] || 5; // showDetails2 view does not exist when upgrading to 2.2.3
  }

  /**
   * Handle custom shortcut action
   * summoned via `handleKeyboardEvent`
   * @param event - keyboard event
   * @param shortcutAction - CustomShortcutAction
   */
  handleCustomShortcutAction(event: KeyboardEvent, shortcutAction: CustomShortcutAction): void {
    switch (shortcutAction) {

      case ('toggleSettings'):
        if (this.wizard.showWizard === false) {
          this.toggleSettings();
        }
        break;

      case ('showAutoTags'):
        if (!this.wizard.showWizard) {
          this.toggleButton('showTags');
        }
        break;

      case ('showTagTray'):
        if (!this.wizard.showWizard) {
          this.toggleButton('showTagTray');
        }
        break;

      case ('quit'):
        event.preventDefault();
        event.stopPropagation();
        this.initiateClose();
        break;

      case ('startWizard'):
        this.startWizard();
        this.settingsModalOpen = false;
        this.settingsButtons['showTags'].toggled = false;
        break;

      case ('toggleMinimalMode'):
        this.toggleButton('hideTop');
        this.toggleButton('hideSidebar');
        this.toggleButtonOff('showTagTray');
        this.toggleRibbon();
        this.toggleButton('showMoreInfo');
        break;

      case ('focusOnFile'):
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

      case ('focusOnMagic'):
        if (!this.settingsButtons['magic'].toggled) {
          this.settingsButtons['magic'].toggled = true;
        }
        this.showSidebar();
        setTimeout(() => {
          this.magicSearch.nativeElement.focus();
        }, 1);
        break;

      case ('fuzzySearch'):
        if (!this.settingsButtons['fuzzy'].toggled) {
          this.settingsButtons['fuzzy'].toggled = true;
        }
        this.showSidebar();
        setTimeout(() => {
          this.fuzzySearch.nativeElement.focus();
        }, 1);
        break;
    }

  }

  /**
   * Perform appropriate action when a button is clicked
   * @param   uniqueKey   the uniqueKey string of the button
   * @param   fromIpc     boolean value indicate, call from IPC
   */
  toggleButton(uniqueKey: SettingsButtonKey | SupportedView | SupportedTrayView, fromIpc = false): void {
    // ======== View buttons ================
    if (AllSupportedViews.includes(<SupportedView>uniqueKey)) {
      this.savePreviousViewSize();
      this.toggleAllViewsButtonsOff();
      this.toggleButtonTrue(uniqueKey);
      this.restoreViewSize(uniqueKey);
      this.appState.currentView = <SupportedView>uniqueKey;
      this.computeTextBufferAmount();
      this.virtualScroller.invalidateAllCachedMeasurements();
      this.scrollToTop();

      // ======== Bottom tray views buttons =========================
    } else if (AllSupportedBottomTrayViews.includes(<SupportedTrayView>uniqueKey)) {
      const stateBeforeClick: boolean = this.settingsButtons[uniqueKey].toggled;
      this.toggleAllTrayViewsButtonsOff();
      if (this.batchTaggingMode) {
        this.toggleBatchTaggingMode();
      }
      this.settingsButtons[uniqueKey].toggled = !stateBeforeClick;

      if (
             (uniqueKey === 'showRelatedVideosTray' && this.settingsButtons['showRelatedVideosTray'].toggled)
          || (uniqueKey === 'showRecentlyPlayed'    && this.settingsButtons['showRecentlyPlayed'].toggled)
      ) {
        this.computePreviewWidth();
      }

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
      this.virtualScroller.refresh();
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
    } else if (uniqueKey === 'showTags') {
      if (this.settingsModalOpen) {
        this.settingsModalOpen = false;
      }
      this.toggleButtonOpposite('showTags');
    } else if (uniqueKey === 'playPlaylist') {
      const execPath: string = this.appState.preferredVideoPlayer;
      this.electronService.ipcRenderer.send(
        'please-create-playlist',
        this.pipeSideEffectService.galleryShowing,
        this.sourceFolderService.selectedSourceFolder,
        execPath
      );
    } else if (uniqueKey === 'sortOrder') {
      this.toggleButtonOpposite(uniqueKey);
      setTimeout(() => {
        if (this.sortOrderRef.sortFilterElement) { // just in case, perform check
          this.sortOrderRef.sortFilterElement.nativeElement.value = this.sortType;
        }
      });
    } else if (uniqueKey === 'shuffleGalleryNow') {
      this.sortType = 'random';
      this.shuffleTheViewNow++;
      this.scrollToTop();
      // if sort filter is NOT showin on the sidebar, enable
      if (!this.sortOrderRef.sortFilterElement) {
        this.settingsButtons['sortOrder'].toggled = true;
      }
      // and set the setting-option to `Random' after timeout to update view
      setTimeout(() => {
        if (this.sortOrderRef.sortFilterElement) { // just in case, perform check
          this.sortOrderRef.sortFilterElement.nativeElement.value = 'random';
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

  public toggleButtonOff(uniqueKey: SettingsButtonKey | SupportedView | SupportedTrayView): void {
    if (this.settingsButtons[uniqueKey].toggled) {
      this.settingsButtons[uniqueKey].toggled = false;
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
      clipHeight: 144, // default = half the screenshot height
      clipSnippetLength: 1,
      clipSnippets: 5,
      extractClips: false,
      futureHubName: '',
      isFixedNumberOfScreenshots: true,
      screenshotSizeForImport: 288, // default
      selectedOutputFolder: '',
      selectedSourceFolder: { 0: { path: '', watch: false }},
      showWizard: true,
      ssConstant: 10,
      ssVariable: 10,
    };
    this.toggleSettings();
  }


  // ==========================================================================================
  // Methods for RESCAN
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
    } else if (this.appState.currentView === 'showDetails2') {
      if (this.currentImgsPerRow > 3) {
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
      || this.appState.currentView === 'showDetails2'
    ) {
      const margin: number = (this.settingsButtons['compactView'].toggled ? 4 : 40);
      this.previewWidth = (this.galleryWidth / this.currentImgsPerRow) - margin;
    } else if (
         this.appState.currentView === 'showFilmstrip'
      || this.appState.currentView === 'showFullView'
    ) {
      this.previewWidth = ((this.galleryWidth - 30) / this.currentImgsPerRow);
    }

    this.previewHeight = this.previewWidth * (9 / 16);

    // compute preview dimensions for thumbs in the most similar tab:
    if (
         this.settingsButtons['showRelatedVideosTray'].toggled
      || this.settingsButtons['showRecentlyPlayed'].toggled
    ) {
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
   * Show or hide the ribbon
   */
  toggleRibbon(): void {
    this.appState.menuHidden = !this.appState.menuHidden;
  }

  // ---- HANDLE EXTRACTING AND RESTORING SETTINGS ON OPEN AND BEFORE CLOSE ------

  /**
   * Prepare and return the settings object for saving
   * happens right before closing the app !!!
   */
  getSettingsForSave(): SettingsObject {

    const buttonSettings = {};

    this.grabAllSettingsKeys().forEach(element => {
      buttonSettings[element] = {
        toggled: this.settingsButtons[element].toggled,
        hidden: this.settingsButtons[element].hidden,
      };
    });

    // console.log(buttonSettings);
    return {
      appState: this.appState,
      buttonSettings: buttonSettings,
      shortcuts: this.shortcutService.keyToActionMap,
      vhaFileHistory: this.vhaFileHistory,
      windowSizeAndPosition: undefined, // is added in `cose-window` in `main.ts`
    };
  }

  /**
   * Return all keys from the settings-buttons
   */
  grabAllSettingsKeys(): SettingsButtonKey[] {
    const objectKeys: SettingsButtonKey[] = [];

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
    this.settingsButtons = JSON.parse(JSON.stringify(this.defaultSettingsButtons)); // JSON hack to allow resetting more than once
    this.toggleButton('showThumbnails');
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
        this.appState.imgsPerRow = DefaultImagesPerRow;
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
    } else if (<any>locale.substring(0, 2)) {
      this.changeLanguage(<any>locale.substring(0, 2));
    } else {
      this.changeLanguage('en');
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
   * When in double-click mode and a video is clicked - `currentClickedItemName` updated
   * @param item
   */
  assignSelectedFile(item: ImageElement): void {
    this.currentClickedItemName = item.cleanName;
  }

  /**
   * Opens the thumbnail sheet for the selected video
   */
  openThumbnailSheet(item: ImageElement): void {
    this.sheetItemToDisplay = item;
    this.sheetOverlayShowing = true;
  }

  /**
   * Deletes a file (moves to recycling bin / trash) or dangerously deletes (bypassing trash)
   */
  deleteThisFile(item: ImageElement): void {
    const base: string = this.sourceFolderService.selectedSourceFolder[item.inputSource].path;
    const dangerously: boolean = this.settingsButtons['dangerousDelete'].toggled;
    this.electronService.ipcRenderer.send('delete-video-file', base, item, dangerously);
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
    this.autoTagsSaveService.restoreSavedTags(
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
    this.translate.use(language);
    this.translate.setTranslation(language, LanguageLookup[language]);
    this.appState.language = language;

    this.updateSystemMessages();
  }

  /**
   * Update the systemMessages `main.ts`
   * so that ... i18n everywhere!
   */
  updateSystemMessages() {
    const newMessages = {};

    for (const key in LanguageLookup['en'].SYSTEM) {
      if (LanguageLookup['en'].SYSTEM[key]) {
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
  checkTagTypeahead(text: string) {
    this.tagTypeAhead = this.manualTagsService.getTypeahead(text);
  }

  /**
   * Add tag to search when pressing tab
   * !!! but only when on the tag search field !!!
   * @param origin -- the `j` in the template, just pass it on to the `onEnterKey`
   */
  typeaheadTabPressed(origin: number): void {
    if (this.tagTypeAhead !== '') {
      this.onEnterKey(this.tagTypeAhead, origin);
      this.tagTypeAhead = '';
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

  newSizeFilterSelected(selection: number[]): void {

    this.sizeLeftBound = selection[0];

    if (selection[1] > this.sizeOutlierCutoff - 10) {
      this.sizeRightBound = Infinity;
    } else {
      this.sizeRightBound = selection[1];
    }

  }

  setUpDurationFilterValues(finalArray: ImageElement[]): void {
    const durations: number[] = finalArray.map((element) => { return element.duration; });

    const cutoff = this.getOutlierCutoff(durations);

    this.durationOutlierCutoff = Math.floor(cutoff);
  }

  setUpSizeFilterValues(finalArray: ImageElement[]): void {
    const fileSizes: number[] = finalArray.map((element) => { return element.fileSize; });

    this.sizeOutlierCutoff = Math.max(...fileSizes);
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
    this.imageElementService.imageElements.forEach((element: ImageElement) => {
      if (element.selected) {
        this.addTagToThisElement(tag, element);
      }
    });

    this.ifShowDetailsViewRefreshTags();
  }

  /**
   * Add a tag to some element
   * Also updates the tag count in `manualTagsService`
   * @param tag
   * @param element
   */
  addTagToThisElement(tag: string, element: ImageElement): void {
    if (!element.tags || !element.tags.includes(tag)) {

      this.manualTagsService.addTag(tag); // only updates the count in the tray, nothing else!

      this.imageElementService.HandleEmission({
        type: 'add',
        index: element.index,
        tag: tag
      });
    }
  }

  /**
   * If current view is `showDetails` refresh all showing tags
   * hack to make newly-added tags appear next to videos
   */
  ifShowDetailsViewRefreshTags(): void {
    if (   this.appState.currentView === 'showDetails'
        || this.appState.currentView === 'showDetails2') {
      // details view shows tags but they don't update without some code that forces a refresh :(
      // hack-y code simply hides manual tags and then shows them again
      this.settingsButtons.manualTags.toggled = !this.settingsButtons.manualTags.toggled;
      this.cd.detectChanges();
      this.settingsButtons.manualTags.toggled = !this.settingsButtons.manualTags.toggled;
    }
  }

  /**
   * Toggle between batch tag edit mode and normal mode
   */
  toggleBatchTaggingMode(): void {
    if (this.batchTaggingMode) {
      this.imageElementService.imageElements.forEach((element: ImageElement) => {
        element.selected = false;
      });
    }
    this.batchTaggingMode = !this.batchTaggingMode;
  }

  /**
   * Select all visible videos for batch tagging
   */
  selectAllVisible(): void {
    this.pipeSideEffectService.selectAll();
  }

  /**
   * Check whether new version of the app is available
   */
  checkForNewVersion(): void {
    this.http.get('https://my.videohubapp.com/version.php').subscribe(
      (version: string) => {
        this.latestVersionAvailable = version;
      },
      (err: any) => {
        this.latestVersionAvailable = 'error';
      }
    );
  }

  /**
   * Open browser to `my.videohubapp.com`
   */
  goDownloadNewVersion(): void {
    if (this.demo) {
      this.electronService.ipcRenderer.send('please-open-url', 'https://videohubapp.com');
    } else {
      this.electronService.ipcRenderer.send('please-open-url', 'https://my.videohubapp.com');
    }
  }

  showFirstRunMessage(): void {
    console.log('SHOULD FIX THE FIRST RUN BUG!!!');
    this.toggleButton('showThumbnails');
    this.isFirstRunEver = false;
    this.modalService.openWelcomeMessage();
  }

}
