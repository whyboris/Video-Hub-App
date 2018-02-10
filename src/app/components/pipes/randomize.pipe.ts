import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'randomizePipe'
})
export class RandomizePipe implements PipeTransform {

  /**
   * Return the same array randomized
   * @param galleryArray
   * @param doIt
   */
  transform(galleryArray: any[], doIt: boolean): any[] {

    console.log(doIt);

    if (doIt) {
      let currentIndex = galleryArray.length;
      let temporaryValue;
      let randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = galleryArray[currentIndex];
        galleryArray[currentIndex] = galleryArray[randomIndex];
        galleryArray[randomIndex] = temporaryValue;
      }
      const lol = galleryArray;
      console.log('hi!!!');
      return lol;
    } else {
      return galleryArray;
    }

  }

}
