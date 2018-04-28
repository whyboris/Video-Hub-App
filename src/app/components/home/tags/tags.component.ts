import { Component, Input } from '@angular/core';

import { TagsService } from './tags.service';

import { ImageElement } from 'app/components/common/final-object.interface';

@Component({
  selector: 'app-tags-component',
  templateUrl: 'tags.component.html',
  styleUrls: ['tags.component.scss']
})
export class TagsComponent {

  @Input() finalArray: ImageElement[];

  displayItems: any;

  twoWordCombos: any;

  constructor(
    public tagsService: TagsService
  ) {}

  ngOnInit(): void {

    console.log('tags component loaded');
    // console.log(this.finalArray);

    this.tagsService.resetMap();
    this.finalArray.forEach((element) =>{
      this.tagsService.addString(element[2]);
    });

    this.tagsService.cleanMap();

    this.displayItems = this.tagsService.computeOneWordTags();

    this.tagsService.storeFinalArrayInMemory(this.finalArray);

    this.tagsService.computeTwoWordTags();

    this.twoWordCombos = this.tagsService.getTwoWordCombos();

    this.displayItems = this.tagsService.cleanOneWordMapUsingTwoWordMap();

  }

}