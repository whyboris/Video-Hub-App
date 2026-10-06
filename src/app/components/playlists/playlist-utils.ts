// Drag & drop payload types -- custom so they never clash with tags or files dragged around the app
export const DRAG_ENTRIES = 'application/x-vha-playlist-entries';   // { from: playlistId, ids: entryIds[] }
export const DRAG_PLAYLIST = 'application/x-vha-playlist';          // playlistId

export interface DraggedEntries {
  from: string;
  ids: string[];
}

/**
 * 75 => `1:15`, 3725 => `1:02:05`
 */
export function formatDuration(totalSeconds: number): string {
  const seconds: number = Math.max(0, Math.round(totalSeconds || 0));
  const h: number = Math.floor(seconds / 3600);
  const m: number = Math.floor((seconds % 3600) / 60);
  const s: number = seconds % 60;
  const ss: string = s.toString().padStart(2, '0');
  return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

export function hasDragType(event: DragEvent, type: string): boolean {
  return !!event.dataTransfer && Array.from(event.dataTransfer.types).includes(type);
}
