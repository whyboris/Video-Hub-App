import { ImageElement } from '../src/app/common/final-object.interface';

export interface SavableProperties {
  addTags: string[];      // tags to add
  removeTags: string[];   // tags to remove
  images: ImageElement[];
}
