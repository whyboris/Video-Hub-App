import { Component, EventEmitter, Input, Output, OnDestroy, ViewChild, ElementRef } from '@angular/core';

import { TagsService, WordAndFreq } from './tags.service';

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

  dummyBool: boolean = false;

  constructor(
    public tagsService: TagsService
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
    const matchesFound: number = this.tagsService.findMatches(this.currentAdding);
    if (matchesFound > 0) {
      const itemToAdd: WordAndFreq = {
        word: this.currentAdding,
        freq: matchesFound
      };
      if (this.currentAdding.includes(' ')) {
        this.twoWordTags.push(itemToAdd);
      } else {
        this.oneWordTags.push(itemToAdd);
      }
    }
    this.currentAdding = '';
    this.dummyBool = !this.dummyBool;
  }

  ngOnDestroy(): void {
    this.showEdit = false;
  }

}