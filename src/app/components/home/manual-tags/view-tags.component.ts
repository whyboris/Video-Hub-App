import { Component, Input } from '@angular/core';
import { ManualTags } from './manual-tags.service';

@Component({
  selector: 'app-view-tags-component',
  templateUrl: 'view-tags.component.html',
  styleUrls: ['view-tags.component.scss']
})
export class ViewTagsComponent {

  @Input() tags: string[];

  constructor(
    public tagService: ManualTags
  ) { }

}
