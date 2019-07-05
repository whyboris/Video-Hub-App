import { Injectable } from '@angular/core';

import { SettingsButtons } from '../../common/settings-buttons';
import { autoFileTagsRegex } from './autotags.service';

import { ImageElement } from '../../common/final-object.interface';

export interface Tag {
  name: string;
  colour: string;
  removable: boolean;
}

@Injectable()
export class TagsService {
  settingsButtons = SettingsButtons;

  public getTags(
    video: ImageElement,
    manualTags: boolean,
    autoFileTags: boolean,
    autoFolderTags: boolean,
    uselessTags: string[]
  ): Tag[] {

    const tags: Tag[] = [];

    if (manualTags) {
      if (video.tags) {
        video.tags.forEach(tag => {
          tags.push({name: tag, colour: '#63ff61', removable: true});
        });
      }
    }

    if (autoFileTags) {
      const cleanedFileName: string = video.cleanName.toLowerCase().replace(autoFileTagsRegex, '');
      cleanedFileName.split(' ').forEach(word => {
        if (word.length >= 3) { // don't hardcode :(
          tags.push({name: word, colour: '#a8bffb', removable: false});
        }
      });
    }

    if (autoFolderTags) {
      const cleanedFileName: string = video.partialPath.toLowerCase().replace('.', '');
      cleanedFileName.split('/').forEach(word => {
        if (word.length >= 3) {
          tags.push({name: word, colour: '#fec02f', removable: false});
        }
      });
    }

    return tags;
  }
}
