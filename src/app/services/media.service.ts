import { Injectable, NgZone } from '@angular/core';

import type { MediaPlan } from '../../../interfaces/media-plan.interface';

const PLAN_TIMEOUT_MS = 20000;

/**
 * Asks node how each file should be played (directly, or converted while it plays) and builds
 * the URLs for converted streams -- see `node/main-media.ts`
 */
@Injectable({ providedIn: 'root' })
export class MediaService {

  private plans: Map<string, Promise<MediaPlan>> = new Map();
  private waiting: Map<string, (plan: MediaPlan) => void> = new Map();
  private streamOnly: Set<string> = new Set(); // played directly, failed -- always convert from now on
  private counter = 0;

  constructor(private zone: NgZone) {
    (window as any).myElectron.receiveFromMain('media-plan-returning', (requestId: string, plan: MediaPlan) => {
      const resolve = this.waiting.get(requestId);
      if (resolve) {
        this.waiting.delete(requestId);
        this.zone.run(() => resolve(plan)); // the player continues inside Angular
      }
    });
  }

  /**
   * How to play a file -- cached per path for the session
   */
  plan(fullPath: string): Promise<MediaPlan> {
    if (this.streamOnly.has(fullPath)) {
      return Promise.resolve({ mode: 'stream', copyAudio: false, reason: 'direct playback failed' });
    }
    if (!this.plans.has(fullPath)) {
      this.plans.set(fullPath, new Promise((resolve) => {
        const requestId: string = 'plan' + (++this.counter);
        this.waiting.set(requestId, resolve);
        (window as any).myElectron.sendToMain('please-plan-media', requestId, fullPath);
        setTimeout(() => {
          if (this.waiting.has(requestId)) {
            this.waiting.delete(requestId);
            this.zone.run(() => resolve({ mode: 'direct', copyAudio: false, reason: 'no answer' }));
          }
        }, PLAN_TIMEOUT_MS);
      }));
    }
    return this.plans.get(fullPath);
  }

  /**
   * Direct playback failed -- convert this file from now on
   */
  markStreamOnly(fullPath: string): void {
    this.streamOnly.add(fullPath);
  }

  /**
   * URL of a converted stream starting at `start` seconds
   * @param duration  seconds to convert, 0 = to the end
   * @param id        one per player slot -- a new stream for the same id stops the previous one
   */
  streamUrl(fullPath: string, start: number, duration: number, copyAudio: boolean, id: string): string {
    const query = new URLSearchParams({
      path: fullPath,
      start: Math.max(0, start).toFixed(3),
      duration: Math.max(0, duration).toFixed(3),
      id: id,
      audio: copyAudio ? 'copy' : 'aac',
      n: String(++this.counter), // a fresh URL even when restarting at the same spot
    });
    return 'vha-media://stream/?' + query.toString();
  }

  stop(id: string): void {
    (window as any).myElectron.sendToMain('stop-media-stream', id);
  }

  stopAll(): void {
    (window as any).myElectron.sendToMain('stop-all-media-streams');
  }

}
