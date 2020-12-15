import { Component, Input, OnInit, ChangeDetectorRef, Output, EventEmitter, OnDestroy } from '@angular/core';

import { Observable, Subscription } from 'rxjs';

import { ElectronService } from '../../providers/electron.service';
import { SourceFolderService } from './source-folder.service';

import { ImageElement, ScreenshotSettings, InputSources } from '../../../../interfaces/final-object.interface';
import { metaAppear, breadcrumbWordAppear } from '../../common/animations';
import { ImageElementService } from './../../services/image-element.service';

export interface ServerDetails {
  port: number;
  wifi: string;
  host: string;
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: [
    '../wizard/wizard.component.scss',
    '../settings.scss',
    '../wizard-button.scss',
    './statistics.component.scss',
    './toggle.scss'
  ],
  animations: [metaAppear, breadcrumbWordAppear]
})
export class StatisticsComponent implements OnInit, OnDestroy {

  @Output() deleteInputSourceFiles = new EventEmitter<number>();
  @Output() finalArrayNeedsSaving = new EventEmitter<any>();
  @Output() startServerOnPort = new EventEmitter<number>();

  @Input() hubName: string;
  @Input() inputFolders: InputSources;
  @Input() numFolders: number;
  @Input() pathToVhaFile: string;
  @Input() screenshotSettings: ScreenshotSettings;

  @Input() inputFolderChosen: Observable<string>;
  @Input() numberScreenshotsDeleted: Observable<number>;
  @Input() oldFolderReconnected: Observable<{ source: number, path: string }>;
  @Input() serverDetails: Observable<any>;

  eventSubscriptionMap: Map<string, Subscription> = new Map();

  totalFiles: number;

  selectedPort = 3000;

  longest: number = 0;
  shortest: number = Infinity;
  totalLength: number = 0;
  avgLength: number;

  largest: number = 0;
  smallest: number = Infinity;
  totalSize: number = 0;
  avgSize: number;

  showNumberDeleted: boolean = false;
  numberOfScreensDeleted: number = 0;

  removeFoldersMode: boolean = false;

  serverRunning: boolean = false;

  serverInfo: ServerDetails;

  objectKeys = Object.keys; // to use in template

  constructor(
    public cd: ChangeDetectorRef,
    public electronService: ElectronService,
    public sourceFolderService: SourceFolderService,
    public imageElementService: ImageElementService
  ) { }

  ngOnInit() {
    console.log('booting up!');
    this.computeAverages();

    // IPC subscriptions - come in as BehaviorSubject.asObservable()

    this.eventSubscriptionMap.set('serverDetails', this.serverDetails.subscribe((serverDetails: ServerDetails) => {
      console.log('STATS RECEIVED:');
      console.log(serverDetails);
      if (serverDetails) {
        this.serverRunning = true;
        this.serverInfo = serverDetails;
      } else {
        this.serverRunning = false;
      }
      this.cd.detectChanges();
    }));

    this.eventSubscriptionMap.set('inputFolder', this.inputFolderChosen.subscribe((folderPath: string) => {
      if (folderPath) { // first emit from subscription is `undefined`
        this.handleInputFolderChosen(folderPath);
      }
    }));

    this.eventSubscriptionMap.set('folderReconnect', this.oldFolderReconnected.subscribe((data) => {
      if (data) { // first emit from subscription is `undefined`
        this.handleOldFolderReconnected(data.source, data.path);
      }
    }))

    this.eventSubscriptionMap.set('numberOfScreenshotsDeleted', this.numberScreenshotsDeleted.subscribe((deleted: number) => {
      if (deleted !== undefined) { // first emit from subscription is `undefined`
        this.handleScreenshotsDeleted(deleted);
      }
    }));
  }

  /**
   * After booting up, compute all the totals and averages to display
   */
  computeAverages() {
    console.log(this.inputFolders);

    this.imageElementService.imageElements.forEach((element: ImageElement): void => {
      this.shortest = Math.min(element.duration, this.shortest);
      this.longest = Math.max(element.duration, this.longest);
      this.totalLength += element.duration;

      this.smallest = Math.min(element.fileSize, this.smallest);
      this.largest = Math.max(element.fileSize, this.largest);
      this.totalSize += element.fileSize;
    });

    this.totalFiles = this.imageElementService.imageElements.length;

    this.avgLength = Math.round(this.totalLength / this.totalFiles);
    this.avgSize = Math.round(this.totalSize / this.totalFiles);
  }

  /**
   * Notify user of how many screenshots were deleted
   * @param numDeleted
   */
  handleScreenshotsDeleted(numDeleted: number) {
    console.log('deleted', numDeleted, 'screenshots');
    setTimeout(() => {

      this.numberOfScreensDeleted = numDeleted;
      this.showNumberDeleted = true;
      this.cd.detectChanges()
      setTimeout(() => {
        this.showNumberDeleted = false;
        this.cd.detectChanges()
      }, 3000);

    }, 1000); // make sure it doesn't appear instantly -- feels like an error if it happens to quickly :P
  }

  /**
   * Handle when old folder reconnects
   * @param sourceIndex
   * @param newPath
   */
  handleOldFolderReconnected(sourceIndex: number, newPath: string) {
    console.log('NEW FOLDER CHOSEN !!!');
    console.log(sourceIndex);
    console.log(newPath);
    this.inputFolders[sourceIndex] = { path: newPath, watch: false };
    this.sourceFolderService.sourceFolderConnected[sourceIndex] = true;
    setTimeout(() => {
      this.cd.detectChanges();
    }, 1);
  }

  /**
   * DO STUFF WHEN INPUT FOLDER WAS CHOSEN !!!
   * @param filePath
   */
  handleInputFolderChosen(filePath: string) {
    console.log('IT WORKS !!!!!');
    console.log('chosen: ', filePath);

    let pathAlreadyExists = false;

    Object.keys(this.inputFolders).forEach((key: string) => {
      if (this.inputFolders[key].path === filePath) {
        pathAlreadyExists = true;
      }
    });

    if (!pathAlreadyExists) {
      const nextIndex: number = this.pickNextIndex(this.inputFolders);
      this.inputFolders[nextIndex] = { path: filePath, watch: false };
      this.sourceFolderService.sourceFolderConnected[nextIndex] = true;
      this.electronService.ipcRenderer.send('start-watching-folder', nextIndex, filePath, false);
    }

    this.cd.detectChanges();

  }


  /**
   * Determine and return the next index for inputSource
   * Simply the next integer larger than the largest currently used index
   * @param inputSource
   */
  pickNextIndex(inputSource: InputSources) {
    const indexesAsStrings: string[] = Object.keys(inputSource);
    const indexesAsNumbers: number[] = indexesAsStrings.map((item: string) => parseInt(item, 10));

    return Math.max(...indexesAsNumbers) + 1;
  }

  /**
   * Notify Node of watch status change
   * toggled via checkbox input in template
   */
  folderWatchStatusChange(index: number, shouldWatch: boolean) {
    this.finalArrayNeedsSaving.emit(true);
    console.log(index);
    console.log(shouldWatch);
    if (shouldWatch) {
      console.log(this.inputFolders[index].path);
      this.tellNodeStartWatching(index, this.inputFolders[index].path, shouldWatch);
    } else {
      this.tellNodeStopWatching(index);
    }
  }

  /**
   * Single scan to add any new videos
   * @param index
   */
  rescanFolder(index: number) {
    console.log(index);
    console.log(typeof(index));
    console.log(this.inputFolders[index].path);
    this.tellNodeStartWatching(index, this.inputFolders[index].path, false);
    setTimeout(() => {
      this.cd.detectChanges(); // to update template whether to show "Rescan" or not
    }, 1);
  }

  /**
   * Add any missing thumbnails / resume thumbnail import
   * Tell node to find and extract all missing thumbnails
   */
  addMissingThumbnails() {
    console.log('trying to extract missing thumbnails');
    this.electronService.ipcRenderer.send(
      'add-missing-thumbnails',
      this.imageElementService.imageElements,
      this.screenshotSettings.clipSnippets > 0);
  }

  /**
   * Summon system modal to select folder
   */
  addAnotherFolder() {
    this.electronService.ipcRenderer.send('choose-input');
  }

  reconnectThisFolder(itemSourceKey: number) {
    console.log('RECONNECT this folder:', itemSourceKey);
    this.electronService.ipcRenderer.send('reconnect-this-folder', itemSourceKey);
  }

  /**
   * Delete an item source
   * @param itemSourceKey
   */
  deleteInputSource(itemSourceKey: number) {
    console.log(itemSourceKey);
    console.log(this.inputFolders[itemSourceKey]);
    this.tellNodeStopWatching(itemSourceKey);
    delete this.inputFolders[itemSourceKey];
    delete this.sourceFolderService.sourceFolderConnected[itemSourceKey];
    this.deleteInputSourceFiles.emit(itemSourceKey);
  }

  /**
   * Tell node to delete all screenshots that are no longer in the hub
   */
  cleanScreenshotFolder(): void {
    console.log('cleaning screenshots!');
    this.electronService.ipcRenderer.send('clean-old-thumbnails', this.imageElementService.imageElements);
  }

  /**
   * Tell node to stop watching a particular folder
   * @param itemSourceKey from InputSources
   */
  tellNodeStopWatching(itemSourceKey: number) {
    this.electronService.ipcRenderer.send('stop-watching-folder', itemSourceKey);
  }

  /**
   * Tell node to start watching a particular folder
   * @param itemSourceKey from InputSources
   */
  tellNodeStartWatching(itemSourceKey: number, path: string, persistent: boolean) {
    this.electronService.ipcRenderer.send('start-watching-folder', itemSourceKey, path, persistent);
  }

  trackByFn(index, item) {
    return(item.key);
  }

  /**
   * Show the gradient swipe-back-and-forth-animation for 3 seconds after clicking "rescan"
   * @param event
   */
  animateThis(event) {
    event.srcElement.classList.add('progress-gradient-animation');
    setTimeout(() => {
      if (event.srcElement.classList) { // this might not even be needed it seems
        event.srcElement.classList.remove('progress-gradient-animation');
      }
    }, 3000); // apparently nothing breaks if the component is closed before timeout finishes :)
  }

  startServer() {
    if (this.serverRunning) {
      this.startServerOnPort.emit(0);
    } else {
      this.startServerOnPort.emit(this.selectedPort);
    }
  }

  /**
   * Check port any time it changes
   */
  validatePort(port: string) {
    console.log('port', port);
    console.log(typeof(port));
    const parsed: number = parseInt(port, 10);
    console.log(parsed);
    if (!Number.isInteger(parsed)) {
      this.selectedPort = 3000;
    } else if (parsed > 65535) {
      this.selectedPort = 3000;
    } else if (parsed < 2) {
      this.selectedPort = 3000;
    } else {
      this.selectedPort = parsed;
    }
  }

  /**
   * Unsubscribe from all the electron ipc events
   */
  ngOnDestroy() {
    this.eventSubscriptionMap.forEach((value) => {
      value.unsubscribe();
    });
  }

}
