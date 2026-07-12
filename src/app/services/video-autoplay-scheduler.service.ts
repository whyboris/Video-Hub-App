import { Injectable } from '@angular/core';

/**
 * Defers the start of autoplay-driven video playback to idle time, so a fast
 * scroll through the gallery (scanning thumbnails to shortlist content) never
 * pays the cost of starting video decode for rows the user has already
 * scrolled past. The poster/thumbnail image is unaffected -- it renders
 * immediately regardless -- this only gates the actual `.play()` call.
 *
 * Deliberately has no cap and never denies a start outright: every scheduled
 * video eventually plays once the browser has spare cycles (or after the
 * timeout, whichever comes first). If the row is destroyed/scrolled away
 * before that happens, the caller cancels it via the returned function and it
 * simply never starts -- no CPU/heat ever spent on it.
 */
@Injectable({ providedIn: 'root' })
export class VideoAutoplaySchedulerService {

  private readonly idleTimeout = 1500; // upper bound so a busy idle queue can't starve playback indefinitely
  private readonly maxJitter = 300; // spreads out starts that become idle-eligible in the same tick

  /**
   * @param startFn called once the browser is idle (or the timeout elapses)
   * @returns a cancel function -- call it if the video is scrolled away/destroyed
   *          before startFn has run, so it never fires at all
   */
  schedule(startFn: () => void): () => void {
    let cancelled = false;
    let jitterHandle: ReturnType<typeof setTimeout> | undefined;

    const ric: (cb: IdleRequestCallback, opts?: IdleRequestOptions) => number =
      (window as any).requestIdleCallback || ((cb: () => void) => window.setTimeout(cb, this.idleTimeout));
    const cic: (handle: number) => void =
      (window as any).cancelIdleCallback || window.clearTimeout;

    const idleHandle = ric(() => {
      if (cancelled) {
        return;
      }
      jitterHandle = setTimeout(() => {
        if (!cancelled) {
          startFn();
        }
      }, Math.floor(Math.random() * this.maxJitter));
    }, { timeout: this.idleTimeout });

    return () => {
      cancelled = true;
      cic(idleHandle);
      if (jitterHandle !== undefined) {
        clearTimeout(jitterHandle);
      }
    };
  }

}
