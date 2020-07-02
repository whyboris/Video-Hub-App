import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { ElectronService } from '../../providers/electron.service';
import { FilePathService } from '../views/file-path.service';
import { ManualTagsService } from '../tags-manual/manual-tags.service';

import { StarRating, ImageElement, InputSources } from '../../../../interfaces/final-object.interface';
import { TagEmit, TagEmission } from '../../../../interfaces/shared-interfaces';
import { YearEmission } from '../views/details/details.component';

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
  @Output() filterTag = new EventEmitter<TagEmit>();

  @Input() video: ImageElement;

  @Input() darkMode: boolean;
  @Input() imgHeight: number;
  @Input() largerFont: boolean;
  @Input() maxWidth: number;
  @Input() showMeta: boolean;
  @Input() star: StarRating;
  @Input() showManualTags: boolean;
  @Input() showAutoFileTags: boolean;
  @Input() showAutoFolderTags: boolean;
  @Input() selectedSourceFolder: InputSources;

  starRatingHack: StarRating;
  yearHack: number;

  tagViewUpdateHack: boolean = false;

  renamingWIP: string = '';
  renameError: boolean = false;

  constructor(
    private cd: ChangeDetectorRef,
    public electronService: ElectronService,
    public filePathService: FilePathService,
    public manualTagsService: ManualTagsService,
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.starRatingHack = this.star;
    this.yearHack = this.video.year;

    this.renamingWIP = this.video.cleanName; // or should this be video.fileName (without extension!?)

    // Rename file response
    this.electronService.ipcRenderer.on(
      'rename-file-response', (
          event,
          index: number,
          success: boolean,
          renameTo: string,
          oldFileName: string,
          errMsg?: string
        ) => {

      if (this.video.index === index) { // make sure the message is about current component's video
        if (success) {
          this.renameError = false;
        } else {
          this.renameError = true;
          this.cd.detectChanges();
        }
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

  filterThisTag(event: TagEmit) {
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

    const sourceFolder = this.selectedSourceFolder[0].path;                       // TODO -- handle every source folder!
    const relativeFilePath = this.video.partialPath;
    const originalFile = this.video.fileName;
    const newFileName = this.renamingWIP + '.' + this.filePathService.getFileNameExtension(this.video.fileName);

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
    this.renameError = false
  }

}
