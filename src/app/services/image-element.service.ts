import { Injectable } from '@angular/core';

import type { DefaultScreenEmission, StarEmission } from '../components/sheet/sheet.component';
import type { ImageElement } from './../../../interfaces/final-object.interface';
import type { TagEmission } from './../../../interfaces/shared-interfaces';
import type { YearEmission} from './../components/views/details/details.component';

@Injectable({ providedIn: 'root' })
export class ImageElementService {

  public finalArrayNeedsSaving = false;
  public forceStarFilterUpdate = true;
  public imageElements: ImageElement[] = [];

  constructor() { }

  /**
   * Update imageElements with emission of element
   * @param emission
   */
  HandleEmission(emission: YearEmission | StarEmission | TagEmission | DefaultScreenEmission): void {
    const index: number = emission.index;

    if (       'year' in emission) {

      this.imageElements[index].year =          (emission as YearEmission).year;

    } else if ('stars' in emission) {

      this.imageElements[index].stars =         (emission as StarEmission).stars;
      this.forceStarFilterUpdate = !this.forceStarFilterUpdate;

    } else if ('defaultScreen' in emission) {

      this.imageElements[index].defaultScreen = (emission as DefaultScreenEmission).defaultScreen;

    } else if ('tag' in emission) {

      this.handleTagEmission(emission as TagEmission);

    } else {
      console.log('THIS SHOULD NOT HAPPEN!');
    }

    this.finalArrayNeedsSaving = true;
  }

  /**
   * Searches through the `finalArray` and updates the file name and display name
   * Should not error out if two files have the same name
   */
  replaceFileNameInFinalArray(renameTo: string, oldFileName: string, index: number): void {

    if (this.imageElements[index].fileName === oldFileName) {
      this.imageElements[index].fileName = renameTo;
      this.imageElements[index].cleanName = renameTo.slice().substr(0, renameTo.lastIndexOf('.'));
    }

    this.finalArrayNeedsSaving = true;
  }

  /**
   * update number of times played & the `lastPlayed` date
   * @param index
   */
  updateNumberOfTimesPlayed(index: number): void {

    this.imageElements[index].lastPlayed = Date.now(); // update `lastPlayed`

    this.imageElements[index].timesPlayed
      ? this.imageElements[index].timesPlayed++
      : this.imageElements[index].timesPlayed = 1;     // update `timesPlayed`

    this.finalArrayNeedsSaving = true;
  }

  /**
   * Toggle heart
   */
  toggleHeart(index: number): void {
    if (this.imageElements[index].stars == 5.5) { // "un-favorite" the video
      this.HandleEmission({
        index: index,
        stars: 0.5
      });
    } else { // "favorite" the video
      this.HandleEmission({
        index: index,
        stars: 5.5
      });
    }
  }

  /**
   * Update playlist field
   */
  updatePlaylist(index: number): void {

    this.imageElements[index].playlist
      ? delete this.imageElements[index].playlist
      : this.imageElements[index].playlist = Date.now();

    this.finalArrayNeedsSaving = true;
  }

  /**
   * Clear out the playlist
   */
  emptyPlaylist(): void {
    this.imageElements.forEach((element) => {
      delete element.playlist;
    });

    this.finalArrayNeedsSaving = true;
  }

  private handleTagEmission(emission: TagEmission): void {
    const position: number = emission.index;
    if (emission.type === 'add') {
      if (this.imageElements[position].tags) {
        this.imageElements[position].tags.push(emission.tag);
      } else {
        this.imageElements[position].tags = [emission.tag];
      }
    } else {
      this.imageElements[position].tags.
        splice(this.imageElements[position].tags.indexOf(emission.tag), 1);
    }
  }

}
