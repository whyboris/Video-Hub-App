import { TagEmission } from './../../../interfaces/shared-interfaces';
import { YearEmission} from './../components/views/details/details.component';
import { ImageElement } from './../../../interfaces/final-object.interface';
import { Injectable } from '@angular/core';
import { DefaultScreenEmission, StarEmission } from '../components/sheet/sheet.component';

@Injectable({
  providedIn: 'root'
})
export class ImageElementService {

public finalArrayNeedsSaving: boolean = false;
public forceStarFilterUpdate: boolean = true;
public imageElements: ImageElement[] = [];
public recentlyPlayed: ImageElement[] = [];

constructor() { }

/**
   * Update imageElements with emission of element
   * @param emission
   */
  HandleEmission(emission: YearEmission | StarEmission | TagEmission | DefaultScreenEmission): void {
    const position: number = emission.index;

    if ('year' in emission) {

      this.imageElements[position].year =          (emission as YearEmission).year;

    } else if ('stars' in emission) {

      this.imageElements[position].stars =         (emission as StarEmission).stars;
      this.forceStarFilterUpdate = !this.forceStarFilterUpdate;

    } else if ('defaultScreen' in emission) {

      this.imageElements[position].defaultScreen = (emission as DefaultScreenEmission).defaultScreen;

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
   * update number of times played
   * @param index
   */
  updateNumberOfTimesPlayed(index: number) {

    this.updateRecentlyPlayed(index);

    this.imageElements[index].timesPlayed ?
    this.imageElements[index].timesPlayed++ :
    this.imageElements[index].timesPlayed = 1;
    this.finalArrayNeedsSaving = true;
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

}
