import { Injectable } from '@angular/core';

/**
 * Caps the number of simultaneously-PLAYING (not just mounted) preview <video>
 * elements across the whole gallery. macOS (and other OSes) only have a finite
 * pool of hardware video-decode sessions; once autoplay pushes past it, extra
 * streams silently fall back to software decode, which is what actually drives
 * up CPU/heat over a few minutes of scrolling with autoplay on.
 *
 * Only autoplay-driven starts should ever call `requestSlot()` -- a user hovering
 * a video is a deliberate, momentary action and must always be allowed to play
 * immediately, so hover-triggered playback must never go through this service.
 */
@Injectable({ providedIn: 'root' })
export class VideoDecodeBudgetService {

  private readonly maxConcurrent = 6; // tune empirically per-machine if needed

  private active = 0;

  requestSlot(): boolean {
    if (this.active >= this.maxConcurrent) {
      return false;
    }
    this.active++;
    return true;
  }

  releaseSlot(): void {
    if (this.active > 0) {
      this.active--;
    }
  }

}
