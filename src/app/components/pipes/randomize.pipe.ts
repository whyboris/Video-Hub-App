import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'randomizePipe'
})
export class RandomizePipe implements PipeTransform {

  /**
   * Return the same array randomized on next search
   * @param galleryArray
   * @param doIt
   */
  transform(galleryArray: any[], doIt: number): any[] {
    if (doIt > 0) {
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
    } else {
      return galleryArray;
    }

  }

}
