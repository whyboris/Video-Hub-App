import { TagEmission } from './../../../interfaces/shared-interfaces';
import { YearEmission, StarEmission } from './../components/views/details/details.component';
import { ImageElement } from './../../../interfaces/final-object.interface';
import { Injectable } from '@angular/core';
import { DefaultScreenEmission } from '../components/sheet/sheet.component';

@Injectable({
  providedIn: 'root'
})
export class ImageElementService {

public imageElements: ImageElement[] = [];
public finalArrayNeedsSaving: boolean = false;
constructor() { }

/**
   * Update FinalArray with new year tag for some element
   * @param emission
   */
  HandleEmission(emission: YearEmission | StarEmission | TagEmission | DefaultScreenEmission): void {
    const position: number = emission.index;
    if ((emission as YearEmission).year) {
      this.imageElements[position].year = (emission as YearEmission).year;
    } else if ((emission as StarEmission).stars) {
      this.imageElements[position].stars = (emission as StarEmission).stars;
    } else if ((emission as DefaultScreenEmission).defaultScreen) {
      this.imageElements[position].defaultScreen = (emission as DefaultScreenEmission).defaultScreen;
    } else {
      this.handleTagEmission(emission as TagEmission);
    }
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
