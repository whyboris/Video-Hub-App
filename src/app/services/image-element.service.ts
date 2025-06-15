import type { TagEmission } from './../../../interfaces/shared-interfaces';
import type { YearEmission} from './../components/views/details/details.component';
import type { ImageElement } from './../../../interfaces/final-object.interface';
import { Injectable } from '@angular/core';
import type { DefaultScreenEmission, StarEmission } from '../components/sheet/sheet.component';

@Injectable({
  providedIn: 'root'
})
export class ImageElementService {

public finalArrayNeedsSaving = false;
public forceStarFilterUpdate = true;
public imageElements: ImageElement[] = [];
public recentlyPlayed: ImageElement[] = [];

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
  updateNumberOfTimesPlayed(index: number) {

    this.updateRecentlyPlayed(index);

    this.imageElements[index].lastPlayed = Date.now();

    this.imageElements[index].timesPlayed ?
    this.imageElements[index].timesPlayed++ :
    this.imageElements[index].timesPlayed = 1;
    this.finalArrayNeedsSaving = true;
  }

  /**
   * Toggle heart
   */
  toggleHeart(index: number) {
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
   * Update recently played
   *  - remove duplicates
   *  - trim to at most 7
   * @param index
   */
  updateRecentlyPlayed(index: number) {
    this.recentlyPlayed = [
      this.imageElements[index],
      ...(this.recentlyPlayed.filter((element: ImageElement) => {
        return element.hash !== this.imageElements[index].hash;
      }))
    ];
    if (this.recentlyPlayed.length > 7) {
      this.recentlyPlayed.length = 7;
    }
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
  /**
   * Find duplicates based on exact fileName match or shared tags
   */
  public findDuplicatesByTagsOrName(): ImageElement[] {
  // 1) Finds all filenames that occur more than once
  const allNames = this.imageElements.map(el => el.fileName);
  const dupNames = new Set(
    allNames.filter((name, i, arr) => arr.indexOf(name) !== i)
  );

  // 2) Finds all tags that occur more than once
  const allTags = this.imageElements.flatMap(el => el.tags || []);
  const dupTags = new Set(
    allTags.filter((tag, i, arr) => arr.indexOf(tag) !== i)
  );

  // 3) Returns every element whose name or whose tags hit one of those duplicates
  return this.imageElements.filter(el =>
    dupNames.has(el.fileName) ||
    (el.tags ?? []).some(tag => dupTags.has(tag))
  );
}

}
