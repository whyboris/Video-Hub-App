import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { ElectronService } from '../../providers/electron.service';
import { FilePathService } from '../views/file-path.service';
import { ManualTagsService } from '../tags-manual/manual-tags.service';

import { StarRating, ImageElement } from '../../../../interfaces/final-object.interface';
import { YearEmission } from '../views/details/details.component';

export interface TagEmission {
  index: number;
  tag: string;
  type: 'add' | 'remove';
}

export interface StarEmission {
  index: number;
  stars: StarRating;
}

@Component({
  selector: 'app-meta-item',
  templateUrl: './meta.component.html',
  styleUrls: [ './meta.component.scss' ]
})
export class MetaComponent implements OnInit {

  @ViewChild('yearInput', { static: false }) yearInput: ElementRef;

  @Output() editFinalArrayStars = new EventEmitter<StarEmission>();
  @Output() editFinalArrayTag = new EventEmitter<TagEmission>();
  @Output() editFinalArrayYear = new EventEmitter<YearEmission>();
  @Output() filterTag = new EventEmitter<object>();

  @Input() video: ImageElement;

  @Input() darkMode: boolean;
  @Input() imgHeight: number;
  @Input() largerFont: boolean;
  @Input() macVersion: boolean;
  @Input() maxWidth: number;
  @Input() showMeta: boolean;
  @Input() star: StarRating;
  @Input() showManualTags: boolean;
  @Input() showAutoFileTags: boolean;
  @Input() showAutoFolderTags: boolean;
  @Input() selectedSourceFolder: string;

  starRatingHack: StarRating;
  yearHack: number;

  tagViewUpdateHack: boolean = false;
  text: String;

  renamingWIP: string = '';
  renameErrMsg: string = '';

  constructor(
    private cd: ChangeDetectorRef,
    public electronService: ElectronService,
    public filePathService: FilePathService,
    public manualTagsService: ManualTagsService,
    public sanitizer: DomSanitizer
  ) {
    this.text = 'no clicks yet';
   }

  ngOnInit() {
    this.starRatingHack = this.star;
    this.yearHack = this.video.year;

    this.renamingWIP = this.video.cleanName; // or should this be video.fileName (without extension!?)

    // Rename file response
    this.electronService.ipcRenderer.on(
      'renameFileResponse', (event, index: number, success: boolean, renameTo: string, oldFileName: string, errMsg?: string) => {

      if (this.video.index === index) {
        console.log('this message meant for THIS VIDEO !!!!');
      }

      if (success) {
        console.log('yay inside META!');
      } else {
        console.log('err inside META!', errMsg);
        this.cd.detectChanges();
      }
    });
  }

  addThisTag(tag: string) {
    if (this.video.tags && this.video.tags.includes(tag)) {
      // console.log('TAG ALREADY ADDED!');
    } else {
      this.manualTagsService.addTag(tag);

      this.editFinalArrayTag.emit({
        index: this.video.index,
        tag: tag,
        type: 'add'
      });
    }
    this.tagViewUpdateHack = !this.tagViewUpdateHack;
  }

  filterThisTag(event: object) {
    this.filterTag.emit(event);
  }

  removeThisTag(tag: string) {
    this.manualTagsService.removeTag(tag);

    this.editFinalArrayTag.emit({
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
    this.starRatingHack = rating; // hack for getting star opacity updated instantly
    this.editFinalArrayStars.emit({
      index: this.video.index,
      stars: rating
    });
  }

  /**
   * Update the FinalArray with the year!
   * @param year
   */
  setYear(year: number): void {
    this.editFinalArrayYear.emit({
      index: this.video.index,
      year: year,
    });
  }

  /**
   * Prevent `e` and `.` input
   * @param event key press on the <input>
   */
  preventUnwantedKeypress(event: any): void {
    if (event.key === '.' || event.key === 'e') {
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
  autoFillYear($event: any) {
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
  tryRenamingFile(event) {
    console.log(1);
    console.log(event);
    // event.target.blur(); // add back later after rename is successful !?
    console.log('trying to rename');
    console.log(this.renamingWIP);
    this.attemptToRename();
  }

  /**
   * Reset file to original name
   * happens on `Esc` key or `blur` event (focus out: via click, `tab` key, view switch, etc)
   */
  resetTitle(event): void {
    console.log(0);
    console.log(event);
    event.target.blur();
    this.renamingWIP = this.video.cleanName;
    event.stopPropagation();
  }


  /**
   * Attempt to rename file
   * check for simple errors locally
   * ask Node to perform rename after
   */
  attemptToRename() {
    // this.nodeRenamingFile = true;
    // this.renameErrMsg = '';

    const sourceFolder = this.selectedSourceFolder;
    const relativeFilePath = this.video.partialPath;
    const originalFile = this.video.fileName;
    const newFileName = this.renamingWIP + '.' + this.filePathService.getFileNameExtension(this.video.fileName);
    // check if different first !!!
    if (originalFile === newFileName) {
      this.renameErrMsg = 'RIGHTCLICK.errorMustBeDifferent';
      // this.nodeRenamingFile = false;
    } else if (this.renamingWIP.length === 0) {
      this.renameErrMsg = 'RIGHTCLICK.errorMustNotBeEmpty';
      // this.nodeRenamingFile = false;
    } else {
      // try renaming
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
}
