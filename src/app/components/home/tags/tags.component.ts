import { Component, EventEmitter, Input, Output, OnDestroy, ViewChild, ElementRef } from '@angular/core';

import { TagsService, WordAndFreq } from './tags.service';
import { TagsSaveService } from './tags-save.service';

import { ImageElement } from '../../../components/common/final-object.interface';

import { slowFadeIn, tagDeleteButton, donutAppear } from '../../../components/common/animations';

@Component({
  selector: 'app-tags-component',
  templateUrl: 'tags.component.html',
  styleUrls: ['../search-input.scss',
              '../fonts/icons.scss',
              '../wizard-button.scss',
              'tags.component.scss'],
  animations: [slowFadeIn, tagDeleteButton, donutAppear]
})
export class TagsComponent implements OnDestroy {

  @Input() finalArray: ImageElement[];
  @Input() hubName: string; // if hubName changes, tagsService will recalculate, otherwise it will show cached

  @Output() tagClicked = new EventEmitter<string>();

  @ViewChild('filterInput') filterInput: ElementRef;

  oneWordTags: WordAndFreq[];
  twoWordTags: WordAndFreq[];

  editMode: boolean = false;

  showEdit: boolean = false;

  currentAdding: string = '';
  currentFiltering: string = '';

  statusMessage: string = '';
  showingStatusMessage: boolean = false;

  constructor(
    public tagsService: TagsService,
    public tagsSaveService: TagsSaveService
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

      this.showStatusMessage('TAG.addSuccess');
      this.currentAdding = '';

    } else {
      this.showStatusMessage('TAG.alreadyExists');
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