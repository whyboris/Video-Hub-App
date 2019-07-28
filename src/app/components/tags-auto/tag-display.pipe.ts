import { Pipe, PipeTransform } from '@angular/core';

import { autoFileTagsRegex } from './autotags.service';

import { ImageElement } from '../common/final-object.interface';

import { Colors } from '../common/colors';

export interface Tag {
  name: string;
  colour: string;
  removable: boolean;
}

@Pipe({
  name: 'tagDisplayPipe'
})
export class TagsDisplayPipe implements PipeTransform {

  transform(
    video: ImageElement,
    manualTags: boolean,
    autoFileTags: boolean,
    autoFolderTags: boolean,
    updateViewHack: boolean
  ): Tag[] {

    const tags: Tag[] = [];

    if (manualTags) {
      if (video.tags) {
        video.tags.forEach(tag => {
          tags.push({name: tag, colour: Colors.manualTags, removable: true});
        });
      }
    }

    if (autoFileTags) {
      const cleanedFileName: string = video.cleanName.toLowerCase().replace(autoFileTagsRegex, '');
      cleanedFileName.split(' ').forEach(word => {
        if (word.length >= 3) { // TODO - fix hardcoding ?
          tags.push({name: word, colour: Colors.autoFileTags, removable: false});
        }
      });
    }

    if (autoFolderTags) {
      const cleanedFileName: string = video.partialPath.toLowerCase().replace('.', '');
      cleanedFileName.split('/').forEach(word => {
        if (word.length >= 3) { // TODO - fix hardcoding ?
          tags.push({name: word, colour: Colors.autoFolderTags, removable: false});
        }
      });
    }

    return tags;
  }
}
