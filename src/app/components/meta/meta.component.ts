import type { OnInit, ElementRef, OnDestroy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import type { Subscription, Observable } from 'rxjs';

import { ElectronService } from '../../providers/electron.service';
import { FilePathService } from '../views/file-path.service';
import { ImageElementService } from './../../services/image-element.service';
import { ManualTagsService } from '../tags-manual/manual-tags.service';

import type { StarRating, ImageElement } from '../../../../interfaces/final-object.interface';
import type { TagEmit, RenameFileResponse } from '../../../../interfaces/shared-interfaces';

import {SettingsButtons } from '../../common/settings-buttons';


@Component({
  selector: 'app-meta-item',
  templateUrl: './meta.component.html',
  styleUrls: [ './meta.component.scss' ]
})
export class MetaComponent implements OnInit, OnDestroy {

  @ViewChild('yearInput', { static: false }) yearInput: ElementRef;
  @ViewChild('videoNotes', { static: false}) videoNotes: ElementRef;

  @Output() filterTag = new EventEmitter<TagEmit>();

  @Input() video: ImageElement;
  @Input() darkMode: boolean;
  @Input() imgHeight: number;
  @Input() largerFont: boolean;
  @Input() maxWidth: number;
  @Input() selectedSourceFolder: string;
  @Input() showAutoFileTags: boolean;
  @Input() showAutoFolderTags: boolean;
  @Input() showManualTags: boolean;
  @Input() showMeta: boolean;
  @Input() showVideoNotes: boolean;
  @Input() star: StarRating;
  @Input() starRatingHack: StarRating;

  @Input() renameResponse: Observable<RenameFileResponse>;

  yearHack: number;

  tagViewUpdateHack = false;

  renamingWIP = '';
  renameError = false;

  responseSubscription: Subscription;

  sortAutoTags = SettingsButtons['sortAutoTags'].toggled;

  constructor(
    private cd: ChangeDetectorRef,
    public electronService: ElectronService,
    public filePathService: FilePathService,
    public imageElementService: ImageElementService,
    public manualTagsService: ManualTagsService,
    public sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.starRatingHack = this.star;
    this.yearHack = this.video.year;

    this.renamingWIP = this.video.cleanName; // or should this be video.fileName (without extension!?)

    this.responseSubscription = this.renameResponse.subscribe((data: RenameFileResponse) => {
      if (data) {
        console.log('Rename response:');
        console.log(data);

        if (this.video.index === data.index) { // make sure the message is about current component's video
          if (data.success) {
            this.renamingWIP = data.renameTo.split('.').slice(0, -1).join('.'); // removes the extension (e.g. ".mp4")
            this.renameError = false;
          } else {
            this.renameError = true;
            this.cd.detectChanges();
          }
        }
      }
    });

  }

  addThisTag(tag: string) {
    if (this.video.tags && this.video.tags.includes(tag)) {
      // console.log('TAG ALREADY ADDED!');
    } else {
      this.manualTagsService.addTag(tag);

      this.imageElementService.HandleEmission({
        index: this.video.index,
        tag: tag,
        type: 'add'
      });
    }
    this.tagViewUpdateHack = !this.tagViewUpdateHack;
  }

  filterThisTag(event: TagEmit) {
    this.filterTag.emit(event);
  }

  removeThisTag(tag: string) {
    this.manualTagsService.removeTag(tag);

    this.imageElementService.HandleEmission({
      index: this.video.index,
      tag: tag,
      type: 'remove'
    });
    this.tagViewUpdateHack = !this.tagViewUpdateHack;
  }

  setStarRating(rating: StarRating): void {
    if (this.starRatingHack === rating) {
      rating = 0.5; // reset to "N/A" (not rated)
    }
    this.imageElementService.HandleEmission({
      index: this.video.index,
      stars: rating,
    });
    this.starRatingHack = rating; // hack for getting star opacity updated instantly
  }

  setHeart(): void {
    if (this.video.stars == 5.5) { // "un-favorite" the video
      this.imageElementService.HandleEmission({
        index: this.video.index,
        stars: 0.5,
      });
      this.starRatingHack = 0.5;
    } else { // "favorite" the video
      this.imageElementService.HandleEmission({
        index: this.video.index,
        stars: 5.5,
      });
      this.starRatingHack = 0.5;

    }
    // stop event propagation (such as opening the video)
    event.stopPropagation();
  }

  /**
   * Update the FinalArray with the year!
   * @param year
   */
  setYear(year: number): void {
    this.imageElementService.HandleEmission({
      index: this.video.index,
      year: year,
    });
  }

  /**
   * Prevent `e` and `.` input
   * @param event key press on the <input>
   */
  preventUnwantedKeypress(event: any): void {
    if (event.key === '.'
     || event.key === 'e'
     || event.key === '-'
     || event.key === '+'
    ) {
      event.preventDefault();
    }
  }

  /**
   * Validate the year and save it to model
   * @param event
   */
  validateYear(event: any): void {
    const currVal = event.target.valueAsNumber;

    if (currVal < 1800 || currVal > 3000) {
      this.yearHack = 2000;
      this.cd.detectChanges();
    } else {
      // when deleting the year, currVal is NaN
      this.yearHack = isNaN(currVal) ? undefined : currVal;
    }
    this.yearInput.nativeElement.blur();
    this.setYear(this.yearHack);
  }

  /**
   * Auto-fill the year if it's not present
   * @param event
   */
  autoFillYear() {
    if (!this.yearHack) {
      this.yearHack = 2000;
      this.setYear(2000);
      setTimeout(() => {
        this.yearInput.nativeElement.select();
      }, 1);
    }
  }

  /**
   * Try renaming file
   * happens on `Enter` / `Return` key press
   */
  tryRenamingFile() {
    this.renameError = false;

    const sourceFolder = this.selectedSourceFolder;
    const relativeFilePath = this.video.partialPath;
    const originalFile = this.video.fileName;
    const newFileName = this.renamingWIP + '.' + this.filePathService.getFileNameExtension(this.video.fileName);

    console.log(sourceFolder);

    if (originalFile !== newFileName && this.renamingWIP.length !== 0) {
      this.electronService.ipcRenderer.send(
        'try-to-rename-this-file',
        sourceFolder,
        relativeFilePath,
        originalFile,
        newFileName,
        this.video.index
      );
    }
  }

  /**
   * Reset file to original name
   * happens on `Esc` key or `blur` event (focus out: via click, `tab` key, view switch, etc)
   */
  resetTitle(event): void {
    event.target.blur();
    this.renamingWIP = this.video.cleanName;
    event.stopPropagation();
    this.renameError = false;
  }

  /**
   * When user clicks outside (that is `onBlur` event) save the currently-written notes to imageElement
   * @param event
   */
  saveVideoNotes(event): void {
    console.log(this.videoNotes.nativeElement.value);
    this.video.notes = this.videoNotes.nativeElement.value;
  }

  ngOnDestroy(): void {
    this.responseSubscription.unsubscribe();
  }
}
