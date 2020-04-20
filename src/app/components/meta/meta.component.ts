import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

// Services
import { ManualTagsService } from '../tags-manual/manual-tags.service';
import { ElectronService } from '../../providers/electron.service';

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

  renamingNow: boolean = false;
  tagViewUpdateHack: boolean = false;
  text: String;

  renamingWIP: string = '';

  constructor(
    private cd: ChangeDetectorRef,
    public electronService: ElectronService,
    private elementRef: ElementRef,
    public manualTagsService: ManualTagsService,
    public sanitizer: DomSanitizer
  ) {
    this.text = 'no clicks yet';
   }

  ngOnInit() {
    this.starRatingHack = this.star;
    this.yearHack = this.video.year;

    this.renamingWIP = this.video.cleanName;

    // Rename file response
    this.electronService.ipcRenderer.on(
      'renameFileResponse', (event, index: number, success: boolean, renameTo: string, oldFileName: string, errMsg?: string) => {

      if (success) {
        this.closeRename();
      } else {
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
   * Close the rename dialog
   */
  closeRename() {
    this.renamingNow = false;
    this.cd.detectChanges();
  }

  /**
   * Try renaming file
   * happens on `Enter` / `Return` key press or on 'blur' (focus out)
   */
  tryRenamingFile(event) {
    event.target.blur();
    console.log('trying to rename');
  }

  /**
   * Close the rename dialog
   */
  openRename() {
    console.log('OPENING!!')
    this.renamingNow = true;
    this.cd.detectChanges();
  }

  resetTitle(event): void {
    console.log(event);
    event.target.blur();
    this.renamingWIP = this.video.cleanName;
  }
}
