import { Component, Input, OnInit } from '@angular/core';

import { ImageElement, ScreenshotSettings } from '../../../../interfaces/final-object.interface';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

  @Input() finalArray: ImageElement[];
  @Input() hubName: string;
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

  constructor() { }

  ngOnInit() {
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
  }

}
