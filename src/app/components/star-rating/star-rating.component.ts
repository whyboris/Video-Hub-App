import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { StarRating } from '../../../../interfaces/final-object.interface';

import { ImageElementService } from './../../services/image-element.service';
import { StarRatingService } from '../../pipes/star-rating.service';

@Component({
  selector: './app-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss']
})
export class StarRatingComponent implements OnInit {
  @Input() index: number;

  starRatingHack: StarRating;

  @Input() set starRating(stars: StarRating) {
    this.starRatingHack = stars;
  }

  constructor(
    public imageElementService: ImageElementService,
    private starRatingService: StarRatingService,
  ) { }

  ngOnInit() {

    this.starRatingService.currentStarRating.subscribe(starRatingList => {
      this.starRating = starRatingList[this.index];
      this.starRatingHack = starRatingList[this.index];
    });


  }

  setStarRating(rating: StarRating): void {
    if (this.starRatingHack === rating) {
      rating = 0.5; // reset to "N/A" (not rated)
    }
    this.starRatingHack = rating; // hack for getting star opacity updated instantly
    this.imageElementService.HandleEmission({
      index: this.index,
      stars: rating
    });

    this.starRatingService.changeStarRating(rating, this.index);
  }
}
