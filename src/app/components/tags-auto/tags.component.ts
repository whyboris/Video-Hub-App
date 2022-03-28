import type { OnDestroy, ElementRef, OnInit } from '@angular/core';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import { AutoTagsSaveService } from './tags-save.service';
import { AutoTagsService, WordAndFreq } from './autotags.service';
import { ImageElementService } from './../../services/image-element.service';

import { slowFadeIn, donutAppear, metaAppear } from '../../common/animations';

@Component({
  selector: 'app-tags-component',
  templateUrl: 'tags.component.html',
  styleUrls: ['../search-input.scss',
              '../../fonts/icons.scss',
              '../wizard-button.scss',
              'tags.component.scss'],
  animations: [slowFadeIn, donutAppear, metaAppear]
})
export class TagsComponent implements OnInit, OnDestroy {

  @Input() hubName: string; // if hubName changes, tagsService will recalculate, otherwise it will show cached

  @Output() tagClicked = new EventEmitter<string>();

  @ViewChild('filterInput', { static: false }) filterInput: ElementRef;

  oneWordTags: WordAndFreq[] = [];
  twoWordTags: WordAndFreq[] = [];

  editMode = false;

  showEdit = false;

  loading = true;

  currentAdding = '';
  currentFiltering = '';

  statusMessage = '';
  showingStatusMessage = false;

  minimumFrequency = 0;

  constructor(
    public autoTagsSaveService: AutoTagsSaveService,
    public imageElemetService: ImageElementService,
    public tagsService: AutoTagsService,
  ) {}

  ngOnInit(): void {

    this.tagsService.generateAllTags(this.imageElemetService.imageElements, this.hubName).then(() => {
      setTimeout(() => {
        this.showEdit = true;
      }, 300);

      setTimeout(() => {
        if (this.filterInput) { // in case user already closed the modal
          this.filterInput.nativeElement.focus();
        }
      }, 350);

      this.loading = false;
      this.oneWordTags = this.tagsService.getOneWordTags();
      this.twoWordTags = this.tagsService.getTwoWordTags();
    });

  }

  /**
   * Emit string to home component to search for this string
   * if in `editMode` update tags accordingly
   */
  tagWasClicked(tag: string): void {
    if (this.editMode) {

      this.tagsService.removeTag(tag);
      this.autoTagsSaveService.addRemoveTag(tag);

      if (tag.includes(' ')) {
        this.twoWordTags = this.tagsService.getTwoWordTags();
      } else {
        this.oneWordTags = this.tagsService.getOneWordTags();
      }
    } else {
      this.tagClicked.emit(tag);
    }
  }

  addThisTag(): any {
    const tagToAdd: string = this.currentAdding.trim();

    if (tagToAdd === '') {
      this.currentAdding = '';

    } else if (this.tagsService.canWeAdd(tagToAdd)) {
      this.autoTagsSaveService.addAddTag(tagToAdd);

      if (this.currentAdding.includes(' ')) {
        this.twoWordTags = this.tagsService.getTwoWordTags();
      } else {
        this.oneWordTags = this.tagsService.getOneWordTags();
      }

      this.showStatusMessage('TAGS.addSuccess');
      this.currentAdding = '';

    } else {
      this.showStatusMessage('TAGS.alreadyExists');
    }
  }

  /**
   * Toggle edit mode (to allow deletion of tags)
   */
  startEditMode(): void {
    this.editMode = !this.editMode;
  }

  /**
   * Temporarily show a message to the user
   * Used to show success or error when adding a tag
   * @param message
   */
  showStatusMessage(message: string): void {
    this.statusMessage = message;
    this.showingStatusMessage = true;
    setTimeout(() => {
      this.showingStatusMessage = false;
    }, 1500);
  }

  /**
   * Set the minimum frequency to show
   * @param min minimum frequency to show
   */
  selectMinFrequency(min: number): void {
    this.minimumFrequency = min;
  }

  /**
   * Clear current tag search if present, otherwise allow app to close the modal
   * @param event
   */
  tagInputEscapePress(event: any): void {
    if (this.currentFiltering.length) {
      event.preventDefault();
      event.stopPropagation();
      this.currentFiltering = '';
    }
  }

  ngOnDestroy(): void {
    this.showEdit = false;
  }

}
