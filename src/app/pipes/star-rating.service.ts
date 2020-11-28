import { EventEmitter, Injectable, Output } from '@angular/core';
import { StarRating } from '../../../interfaces/final-object.interface';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class StarRatingService {
  // finalStarRatingBehaviorSubject = new BehaviorSubject<StarRating>(0.5);
  finalStarRatingBehaviorSubject = new BehaviorSubject<any[]>([]);
  starRatingMap = [];
  currentStarRating = this.finalStarRatingBehaviorSubject.asObservable();

  constructor() { }

  changeStarRating(star: StarRating, index: number) {
    this.starRatingMap[index] = star;
    this.finalStarRatingBehaviorSubject.next(this.starRatingMap);
  }
}
