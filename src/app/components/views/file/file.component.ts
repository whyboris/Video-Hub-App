import { Component, Input, OnInit } from '@angular/core';

import { StarRatingService } from '../../../pipes/star-rating.service';

import { ImageElement } from '../../../../../interfaces/final-object.interface';

@Component({
  selector: 'app-file-item',
  templateUrl: './file.component.html',
  styleUrls: [
      './file.component.scss',
      '../../../fonts/icons.scss',
      '../selected.scss'
    ]
})
export class FileComponent implements OnInit {

  @Input() video: ImageElement;

  @Input() darkMode: boolean;
  @Input() largerFont: boolean;
  @Input() showMeta: boolean;

  constructor(
    private starRatingService: StarRatingService
  ) { }

  ngOnInit() {
    this.starRatingService.changeStarRating(this.video.stars, this.video.index);
  }

}
