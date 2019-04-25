import { Pipe, PipeTransform } from '@angular/core';
import { ImageElement } from '../common/final-object.interface';

export type SortType = 'default'
                     | 'modifiedAsc'
                     | 'modifiedDesc'
                     | 'random'
                     | 'sizeAsc'
                     | 'sizeDesc'
                     | 'starAsc'
                     | 'starDesc'
                     | 'timeAsc'
                     | 'timeDesc'
                     | 'yearAsc'
                     | 'yearDesc'
                     | 'timesPlayedAsc'
                     | 'timesPlayedDesc';

@Pipe({
  name: 'sortingPipe'
})
export class SortingPipe implements PipeTransform {

  /**
   * Return the same array randomized on next search
   * @param galleryArray
   * @param sortingType - sorting method
   * @param forceSortUpdateHack - hack to force the sorting update
   */
  transform(galleryArray: ImageElement[], sortingType: SortType, forceSortUpdateHack: number): ImageElement[] {

    console.log('SORTING RUNNING');

    if (sortingType === 'random') {
      let currentIndex = (galleryArray[0].index === -1 ? 1 : 0); // skip 'up button' if present
      let temporaryValue;
      let randomIndex;

      const newArray = [...galleryArray];

      // While there remain elements to shuffle...
      while (currentIndex !== galleryArray.length) {
        // Pick a remaining element...
        randomIndex = currentIndex + Math.floor(Math.random() * (galleryArray.length - currentIndex));

        // And swap it with the current element.
        temporaryValue = newArray[currentIndex];
        newArray[currentIndex] = newArray[randomIndex];
        newArray[randomIndex] = temporaryValue;

        currentIndex += 1;
      }
      console.log('VIEW SHUFFLED');
      return newArray;
    } else if (sortingType === 'sizeAsc') {
      const sorted = galleryArray.sort((x: ImageElement, y: ImageElement): any => {
        // up button first
        if (x.index === -1) {
          return -1;
        } else if (y.index === -1) {
          return 1;
        }
        return x.fileSize - y.fileSize;
      });
      return sorted.slice(0); // SEND BACK A CLONE - else the vied does not update
    } else if (sortingType === 'sizeDesc') {
      const sorted = galleryArray.sort((x: ImageElement, y: ImageElement): any => {
        // up button first
        if (x.index === -1) {
          return -1;
        } else if (y.index === -1) {
          return 1;
        }
        return y.fileSize - x.fileSize;
      });
      return sorted.slice(0);
    } else if (sortingType === 'timeAsc') {
      const sorted = galleryArray.sort((x: ImageElement, y: ImageElement): any => {
        // up button first
        if (x.index === -1) {
          return -1;
        } else if (y.index === -1) {
          return 1;
        }
        return x.duration - y.duration;
      });
      return sorted.slice(0);
    } else if (sortingType === 'timeDesc') {
      const sorted = galleryArray.sort((x: ImageElement, y: ImageElement): any => {
        // up button first
        if (x.index === -1) {
          return -1;
        } else if (y.index === -1) {
          return 1;
        }
        return y.duration - x.duration;
      });
      return sorted.slice(0);
    } else if (sortingType === 'starAsc') {
      const sorted = galleryArray.sort((x: ImageElement, y: ImageElement): any => {
        // up button first
        if (x.index === -1) {
          return -1;
        } else if (y.index === -1) {
          return 1;
        }
        return x.stars - y.stars;
      });
      return sorted.slice(0);
    } else if (sortingType === 'starDesc') {
      const sorted = galleryArray.sort((x: ImageElement, y: ImageElement): any => {
        // up button first
        if (x.index === -1) {
          return -1;
        } else if (y.index === -1) {
          return 1;
        }
        return y.stars - x.stars;
      });
      return sorted.slice(0);
    } else if (sortingType === 'yearAsc') {
      const sorted = galleryArray.sort((x: ImageElement, y: ImageElement): any => {
        // up button first
        if (x.index === -1) {
          return -1;
        } else if (y.index === -1) {
          return 1;
        }
        return (x.year || 0) - (y.year || 0);
      });
      return sorted.slice(0);
    } else if (sortingType === 'yearDesc') {
      const sorted = galleryArray.sort((x: ImageElement, y: ImageElement): any => {
        // up button first
        if (x.index === -1) {
          return -1;
        } else if (y.index === -1) {
          return 1;
        }
        return (y.year || 0) - (x.year || 0);
      });
      return sorted.slice(0);
    } else if (sortingType === 'timesPlayedAsc') {
      const sorted = galleryArray.sort((x: ImageElement, y: ImageElement): any => {
        // up button first
        if (x.index === -1) {
          return -1;
        } else if (y.index === -1) {
          return 1;
        }
        return x.timesPlayed - y.timesPlayed;
      });
      return sorted.slice(0);
    } else if (sortingType === 'timesPlayedDesc') {
      const sorted = galleryArray.sort((x: ImageElement, y: ImageElement): any => {
        // up button first
        if (x.index === -1) {
          return -1;
        } else if (y.index === -1) {
          return 1;
        }
        return y.timesPlayed - x.timesPlayed;
      });
      return sorted.slice(0);
    } else if (sortingType === 'modifiedAsc') {
      const sorted = galleryArray.sort((x: ImageElement, y: ImageElement): any => {
        // up button first
        if (x.index === -1) {
          return -1;
        } else if (y.index === -1) {
          return 1;
        }
        return x.mtime - y.mtime;
      });
      return sorted.slice(0);
    } else if (sortingType === 'modifiedDesc') {
      const sorted = galleryArray.sort((x: ImageElement, y: ImageElement): any => {
        // up button first
        if (x.index === -1) {
          return -1;
        } else if (y.index === -1) {
          return 1;
        }
        return y.mtime - x.mtime;
      });
      return sorted.slice(0);
    } else {
      console.log('default sort');
      const sorted = galleryArray.sort((x: ImageElement, y: ImageElement): any => {
        // up button first
        if (x.index === -1) {
          return -1;
        } else if (y.index === -1) {
          return 1;
        }
        return x.index - y.index;
      });
      return sorted.slice(0);
    }

  }

}
