import type { PipeTransform } from "@angular/core";
import { Pipe } from "@angular/core";

import type { ImageElement } from "../../../interfaces/final-object.interface";

@Pipe({
  name: "startWithSearchPipe",
})
export class StartWithSearchPipe implements PipeTransform {
  /**
   * Return only items that names start with search string
   * @param finalArray
   * @param searchString  the search string
   */
  transform(finalArray: ImageElement[], searchString?: string): ImageElement[] {
    if (searchString.length > 0) {
      return finalArray.filter((item) =>
        item.cleanName.split(" ").find((word) => word.startsWith(searchString))
      );
    } else {
      return finalArray;
    }
  }
}
