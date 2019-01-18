import { Pipe, PipeTransform } from '@angular/core';
import { ImageElement } from '../common/final-object.interface';

export type SortType = 'random' | 'default' | 'sizeAsc' | 'sizeDesc' | 'timeAsc' | 'timeDesc';

@Pipe({
  name: 'sortingPipe'
})
export class SortingPipe implements PipeTransform {

  /**
   * Return the same array randomized on next search
   * @param galleryArray
   * @param doIt
   */
  transform(galleryArray: ImageElement[], sortingType: SortType): ImageElement[] {
    if (sortingType === 'random') {
      let currentIndex = galleryArray.length;
      let temporaryValue;
      let randomIndex;

      const newArray = [...galleryArray];

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = newArray[currentIndex];
        newArray[currentIndex] = newArray[randomIndex];
        newArray[randomIndex] = temporaryValue;
      }
      console.log('SHUFFLING');
      return newArray;
    } else if (sortingType === 'sizeAsc') {
      return galleryArray.sort((x: ImageElement, y: ImageElement): any => {
        console.log(x.fileSize - y.fileSize);
        return x.fileSize - y.fileSize;
      });
    } else if (sortingType === 'sizeDesc') {
      return galleryArray.sort((x: ImageElement, y: ImageElement): any => {
        console.log(y.fileSize - x.fileSize);
        return y.fileSize - x.fileSize;
      });
    } else {
      return galleryArray;
    }

  }

}
