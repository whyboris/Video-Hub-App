import { Component, EventEmitter, Input, Output } from '@angular/core';

import { TagsService, WordAndFreq } from './tags.service';

import { ImageElement } from 'app/components/common/final-object.interface';

@Component({
  selector: 'app-tags-component',
  templateUrl: 'tags.component.html',
  styleUrls: ['tags.component.scss']
})
export class TagsComponent {

  @Input() finalArray: ImageElement[];
  @Input() hubName: string; // if hubName changes, tagsService will recalculate, otherwise it will show cached

  @Output() tagClicked = new EventEmitter<string>();

  oneWordTags: WordAndFreq[];
  twoWordTags: WordAndFreq[];

  constructor(
    public tagsService: TagsService
  ) {}

  ngOnInit(): void {

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

}