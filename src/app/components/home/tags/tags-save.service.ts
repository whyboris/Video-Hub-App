import { Injectable } from '@angular/core';

@Injectable()
export class TagsSaveService {

  addTags: string[] = [];
  removeTags: string[] = [];

  /**
   * Add an `add` tag
   * @param tag
   */
  public addAddTag(tag: string): void {

    const index = this.removeTags.indexOf(tag);
    if (index > -1) {
      console.log('removing from removeTags:' + this.removeTags[index]);
      this.removeTags.splice(index, 1);
    }

    if (this.addTags.indexOf(tag) > -1) {
      this.addTags.push(tag);
    }

    console.log('add tags now:');
    console.log(this.addTags);
  }

  /**
   * Add a `remove` tag
   * @param tag
   */
  public addRemoveTag(tag: string): void {

    for (let i = 0; i < this.addTags.length; i++) {
      if (tag === this.addTags[i]) {
        this.addTags.splice(i, 1);
        console.log('removing: ' + tag);
        break;
      }
    }

    this.removeTags.push(tag);
    console.log(this.removeTags);
  }

  /**
   * Get current add tags
   */
  public getAddTags(): string[] {
    return this.addTags;
  }

  /**
   * get current remove tags
   */
  public getRemoveTags(): string[] {
    return this.removeTags;
  }

  /**
   * Load `add` tags from .vha file
   * @param savedAddTags
   */
  public setAddTags(savedAddTags: string[]): void {
    this.addTags = savedAddTags;
  }

  /**
   * Load `remove` tags from .vha file
   * @param savedRemoveTags
   */
  public setRemoveTags(savedRemoveTags: string[]): void {
    this.removeTags = savedRemoveTags;
  }

}
