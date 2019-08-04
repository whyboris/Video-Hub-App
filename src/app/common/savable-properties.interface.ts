import { ImageElement } from './final-object.interface';

export interface SavableProperties {
  addTags: string[];      // tags to add
  removeTags: string[];   // tags to remove
  images: ImageElement[];
}
