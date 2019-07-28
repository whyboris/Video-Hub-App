import { Component, EventEmitter, Input, Output, OnDestroy, ViewChild, ElementRef, OnInit } from '@angular/core';

import { AutoTagsService, WordAndFreq } from './autotags.service';
import { AutoTagsSaveService } from './tags-save.service';

import { ImageElement } from '../common/final-object.interface';

import { slowFadeIn, donutAppear } from '../common/animations';

@Component({
  selector: 'app-tags-component',
  templateUrl: 'tags.component.html',
  styleUrls: ['../search-input.scss',
              '../fonts/icons.scss',
              '../wizard-button.scss',
              'tags.component.scss'],
  animations: [slowFadeIn, donutAppear]
})
export class TagsComponent implements OnInit, OnDestroy {

  @Input() finalArray: ImageElement[];
  @Input() hubName: string; // if hubName changes, tagsService will recalculate, otherwise it will show cached

  @Output() tagClicked = new EventEmitter<string>();

  @ViewChild('filterInput', { static: false }) filterInput: ElementRef;

  oneWordTags: WordAndFreq[];
  twoWordTags: WordAndFreq[];

  editMode: boolean = false;

  showEdit: boolean = false;

  currentAdding: string = '';
  currentFiltering: string = '';

  statusMessage: string = '';
  showingStatusMessage: boolean = false;

  constructor(
    public tagsService: AutoTagsService,
    public tagsSaveService: AutoTagsSaveService
  ) {}

  ngOnInit(): void {

    setTimeout(() => {
      this.showEdit = true;
    }, 300);

    setTimeout(() => {
      this.filterInput.nativeElement.focus();
    }, 350);

    this.tagsService.generateAllTags(this.finalArray, this.hubName);

    this.oneWordTags = this.tagsService.getOneWordTags();
    this.twoWordTags = this.tagsService.getTwoWordTags();
  }

  /**
   * Emit string to home component to search for this string
   */
  public tagWasClicked(tag: string): void {
    if (this.editMode) {

      this.tagsService.removeTag(tag);
      this.tagsSaveService.addRemoveTag(tag);

      if (tag.includes(' ')) {
        this.twoWordTags = this.tagsService.getTwoWordTags();
      } else {
        this.oneWordTags = this.tagsService.getOneWordTags();
      }
    } else {
      this.tagClicked.emit(tag);
    }
  }

  public addThisTag(): any {
    const tagToAdd: string = this.currentAdding.trim();

    if (tagToAdd === '') {
      this.currentAdding = '';

    } else if (this.tagsService.canWeAdd(tagToAdd)) {
      this.tagsSaveService.addAddTag(tagToAdd);

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

  public startEditMode(): void {
    this.editMode = !this.editMode;
  }

  public showStatusMessage(message: string): void {
    this.statusMessage = message;
    this.showingStatusMessage = true;
    setTimeout(() => {
      this.showingStatusMessage = false;
    }, 1500);
  }

  ngOnDestroy(): void {
    this.showEdit = false;
  }

}
