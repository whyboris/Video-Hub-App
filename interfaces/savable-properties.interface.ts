import { ImageElement, InputSources } from './final-object.interface';

export interface SavableProperties {
  addTags: string[];      // tags to add
  removeTags: string[];   // tags to remove
  images: ImageElement[];
  inputSources: InputSources; // update source folders if user changed them
}
