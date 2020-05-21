import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';

import { ImageElement, ScreenshotSettings, InputSources } from '../../../../interfaces/final-object.interface';

import { ElectronService } from '../../providers/electron.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: [
    './statistics.component.scss',
    './toggle.scss'
  ]
})
export class StatisticsComponent implements OnInit {

  @Input() finalArray: ImageElement[];
  @Input() hubName: string;
  @Input() inputFolders: InputSources;
  @Input() numFolders: number;
  @Input() pathToVhaFile: string;
  @Input() screenshotSettings: ScreenshotSettings;
  @Input() videoFolder: string;

  totalFiles: number;

  longest: number = 0;
  shortest: number = Infinity;
  totalLength: number = 0;
  avgLength: number;

  largest: number = 0;
  smallest: number = Infinity;
  totalSize: number = 0;
  avgSize: number;

  objectKeys = Object.keys; // to use in template

  constructor(
    public cd: ChangeDetectorRef,
    public electronService: ElectronService
  ) { }

  ngOnInit() {

    console.log(this.inputFolders);

    this.finalArray.forEach((element: ImageElement): void => {
      this.shortest = Math.min(element.duration, this.shortest);
      this.longest = Math.max(element.duration, this.longest);
      this.totalLength += element.duration;

      this.smallest = Math.min(element.fileSize, this.smallest);
      this.largest = Math.max(element.fileSize, this.largest);
      this.totalSize += element.fileSize;
    });

    this.totalFiles = this.finalArray.length;

    this.avgLength = Math.round(this.totalLength / this.totalFiles);
    this.avgSize = Math.round(this.totalSize / this.totalFiles);

    this.electronService.ipcRenderer.on('inputFolderChosen', (event, filePath, stuff) => {
      console.log('chosen!!!');

      let pathAlreadyExists = false;

      Object.keys(this.inputFolders).forEach((key: string) => {
        if (this.inputFolders[key].path === filePath) {
          pathAlreadyExists = true;
        }
      });

      if (!pathAlreadyExists) {
        this.inputFolders[this.pickNextIndex(this.inputFolders)] = { path: filePath, watch: false };
        console.log(filePath);
        console.log(stuff);
      }

    });
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
   * Summon system modal to select folder
   */
  addAnotherFolder() {
    this.electronService.ipcRenderer.send('choose-input', 'lol');
  }

  /**
   * Delete an item source
   * @param itemSourceKey
   */
  deleteInputSource(itemSourceKey: number) {
    console.log(itemSourceKey);
    console.log(this.inputFolders);
    delete this.inputFolders[itemSourceKey];
    console.log(this.inputFolders);
  }

  trackByFn(index, item) {
    return(item.key);
  }

}
