import { TagEmission } from './../../../interfaces/shared-interfaces';
import { YearEmission} from './../components/views/details/details.component';
import { ImageElement } from './../../../interfaces/final-object.interface';
import { Injectable } from '@angular/core';
import { DefaultScreenEmission, StarEmission } from '../components/sheet/sheet.component';

@Injectable({
  providedIn: 'root'
})
export class ImageElementService {

public imageElements: ImageElement[] = [];
public finalArrayNeedsSaving: boolean = false;
public forceStarFilterUpdate: boolean = true;
constructor() { }

/**
   * Update imageElements with emission of element
   * @param emission
   */
  HandleEmission(emission: YearEmission | StarEmission | TagEmission | DefaultScreenEmission): void {
    const position: number = emission.index;
    if ((emission as YearEmission).year) {
      this.imageElements[position].year = (emission as YearEmission).year;
    } else if ((emission as StarEmission).stars) {
      this.imageElements[position].stars = (emission as StarEmission).stars;
      this.forceStarFilterUpdate = !this.forceStarFilterUpdate;
    } else if ((emission as DefaultScreenEmission).defaultScreen) {
      this.imageElements[position].defaultScreen = (emission as DefaultScreenEmission).defaultScreen;
    } else {
      this.handleTagEmission(emission as TagEmission);
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
    this.imageElements[index].timesPlayed ?
    this.imageElements[index].timesPlayed++ :
    this.imageElements[index].timesPlayed = 1;
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
