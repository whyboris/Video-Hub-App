import { Component, EventEmitter, Input, Output, OnDestroy, ViewChild, ElementRef } from '@angular/core';

import { TagsService, WordAndFreq } from './tags.service';
import { TagsSaveService } from './tags-save.service';

import { ImageElement } from 'app/components/common/final-object.interface';

import { slowFadeIn, tagDeleteButton } from 'app/components/common/animations';

@Component({
  selector: 'app-tags-component',
  templateUrl: 'tags.component.html',
  styleUrls: ['../search-input.scss',
              '../fonts/icons.scss',
              '../wizard-button.scss',
              'tags.component.scss'],
  animations: [slowFadeIn, tagDeleteButton]
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
      console.log(tag + ' deleted!');
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
    if (this.tagsService.canWeAdd(this.currentAdding)) {
      console.log(this.currentAdding + ' added!');
      this.tagsSaveService.addAddTag(this.currentAdding);

      if (this.currentAdding.includes(' ')) {
        this.twoWordTags = this.tagsService.getTwoWordTags();
      } else {
        this.oneWordTags = this.tagsService.getOneWordTags();
      }
    } else {
      console.log('error!');
    }
    this.currentAdding = '';
  }

  public startEditMode(): any {
    this.editMode = !this.editMode;
  }

  ngOnDestroy(): void {
    this.showEdit = false;
  }

}