import { Injectable } from '@angular/core';

@Injectable()
export class AutoTagsSaveService {

  addTags: string[] = [];
  removeTags: string[] = [];

  needToSaveTags = false;

  /**
   * Return `true` if tags have been updated
   */
  public needToSave(): boolean {
    return this.needToSaveTags;
  }

  /**
   * Add an `add` tag
   * @param tag
   */
  public addAddTag(tag: string): void {
    this.needToSaveTags = true;

    const index = this.removeTags.indexOf(tag);

    if (index > -1) {
      this.removeTags.splice(index, 1);
    }

    if (this.addTags.indexOf(tag) === -1) {
      this.addTags.push(tag);
    }

    // console.log(this.addTags);
  }

  /**
   * Add a `remove` tag
   * @param tag
   */
  public addRemoveTag(tag: string): void {
    this.needToSaveTags = true;

    const index = this.addTags.indexOf(tag);

    if (index > -1) {
      this.addTags.splice(index, 1);
    }

    if (this.removeTags.indexOf(tag) === -1) {
      this.removeTags.push(tag);
    }

    // console.log(this.removeTags);
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
   * Load `addTags` and `removeTags` from the .vha file
   * @param savedAddTags
   * @param savedRemoveTags
   */
  public restoreSavedTags(savedAddTags: string[], savedRemoveTags: string[]): void {
    this.addTags = savedAddTags;
    this.removeTags = savedRemoveTags;
    this.needToSaveTags = false;
  }

}
