import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import type { ImageElement } from '../../../interfaces/final-object.interface';

@Injectable()
export class PipeSideEffectService {

  cachedTotal = 0;

  galleryShowing: ImageElement[];

  searchResults: BehaviorSubject<number> = new BehaviorSubject(0);

  regexError: BehaviorSubject<boolean> = new BehaviorSubject(false);

  currentPlaylist: ImageElement[] = [];

  playlistUpdateTrigger = new BehaviorSubject<number>(0);

  /**
   * Update the searchResults BehaviorSubject (to show total number of videos showing in gallery)
   * @param total
   */
  showResults(total: number): void {

    if (this.cachedTotal !== total) {
      this.cachedTotal = total;
      this.searchResults.next(this.cachedTotal);
    }

  }

  /**
   * Set all displayed videos to selected
   */
  selectAll(): void {
    this.galleryShowing.forEach((element: ImageElement) => {
      element.selected = true;
    });
  }

  /**
   * If pipe has an
   * @param error
   */
  regexPipeError(error: boolean) {
    this.regexError.next(error);
  }

  /**
   * Playlist pipe stores what is currently showing in the gallery
   * @param results
   */
  saveCurrentResults(results: ImageElement[]): void {
    this.galleryShowing = results;
  }

  saveCurrentPlaylist(playlist: any[]): void {
    // Create a map for faster lookups
    const playlistMap = new Map(playlist.map(item => [item.title, item]));

    // Search the current playlist videos in galleryShowing
    this.currentPlaylist = this.galleryShowing.filter(element =>
      playlistMap.has(element.cleanName)
    );

    // Trigger an update
    this.playlistUpdateTrigger.next(this.playlistUpdateTrigger.value + 1);
  }

  /**
   * Force a playlist refresh by triggering an update
   */
  refreshPlaylist(): void {
    this.playlistUpdateTrigger.next(this.playlistUpdateTrigger.value + 1);
  }

}
