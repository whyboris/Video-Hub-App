import { Injectable } from '@angular/core';

@Injectable()
export class TagsSaveService {

  addTags: string[] = [];
  removeTags: string[] = [];

  needToSaveTags: boolean = false;

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

    console.log(this.addTags);
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
    console.log(savedAddTags);
    this.needToSaveTags = false;
  }

  /**
   * Load `remove` tags from .vha file
   * @param savedRemoveTags
   */
  public setRemoveTags(savedRemoveTags: string[]): void {
    this.removeTags = savedRemoveTags;
    console.log(savedRemoveTags);
    this.needToSaveTags = false // redundant since `setAddTags` is also called
  }

}
