import { Component, EventEmitter, Input, Output, OnDestroy, ViewChild, ElementRef } from '@angular/core';

import { TagsService, WordAndFreq } from './tags.service';
import { TagsSaveService } from './tags-save.service';

import { ImageElement } from 'app/components/common/final-object.interface';

import { slowFadeIn } from 'app/components/common/animations';

@Component({
  selector: 'app-tags-component',
  templateUrl: 'tags.component.html',
  styleUrls: ['../search-input.scss',
              '../wizard-button.scss',
              'tags.component.scss'],
  animations: [slowFadeIn]
})
export class TagsComponent implements OnDestroy {

  @Input() finalArray: ImageElement[];
  @Input() hubName: string; // if hubName changes, tagsService will recalculate, otherwise it will show cached

  @Output() tagClicked = new EventEmitter<string>();

  @ViewChild('filterInput') filterInput: ElementRef;

  oneWordTags: WordAndFreq[];
  twoWordTags: WordAndFreq[];

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
    this.tagClicked.emit(tag);
  }

  public addThisTag(): any {
    if (this.tagsService.canWeAdd(this.currentAdding)) {
      console.log('added!');
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

  ngOnDestroy(): void {
    this.showEdit = false;
  }

}