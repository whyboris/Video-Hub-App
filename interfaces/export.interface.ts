// Exporting a playlist or compilation as one MP4 -- see `node/main-export.ts`

export interface ExportClip {
  path: string;        // full path to the source video
  start: number;       // seconds
  duration: number;    // seconds
  label?: string;      // shown as a caption when `captions` is on
}

export interface ExportJob {
  outputPath: string;
  width: number;       // output frame -- clips are scaled to fit and padded with black
  height: number;
  captions: boolean;   // show each clip's label for its first few seconds
  clips: ExportClip[];
}

export interface ExportProgress {
  fraction: number;    // 0..1 of the whole export
  clip: number;        // 1-based clip being converted; clipCount + 1 while joining
  clipCount: number;
}

export interface ExportResult {
  ok: boolean;
  cancelled: boolean;
  outputPath: string;
  error: string;
  skipped: number[];   // 1-based numbers of clips that could not be converted
}
