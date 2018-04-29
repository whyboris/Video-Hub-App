import { Component, Input } from '@angular/core';

import { TagsService, WordAndFreq } from './tags.service';

import { ImageElement } from 'app/components/common/final-object.interface';

@Component({
  selector: 'app-tags-component',
  templateUrl: 'tags.component.html',
  styleUrls: ['tags.component.scss']
})
export class TagsComponent {

  @Input() finalArray: ImageElement[];

  oneWordTags: WordAndFreq[];
  twoWordTags: WordAndFreq[];

  constructor(
    public tagsService: TagsService
  ) {}

  ngOnInit(): void {

    this.tagsService.generateAllTags(this.finalArray);

    this.oneWordTags = this.tagsService.getOneWordTags();
    this.twoWordTags = this.tagsService.getTwoWordCombos();
  }

}