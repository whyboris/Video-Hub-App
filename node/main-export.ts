import { app, dialog } from 'electron';

import * as path from 'path';
const fs = require('fs');
const os = require('os');
const { spawn, execFile } = require('child_process');

import type { ExportClip, ExportJob, ExportProgress, ExportResult } from '../interfaces/export.interface';

const ffmpegPath: string = require('ffmpeg-static').replace('app.asar', 'app.asar.unpacked');
const ffprobePath: string = require('@ffprobe-installer/ffprobe').path.replace('app.asar', 'app.asar.unpacked');

const FPS = 30;
const CAPTION_SECONDS = 4;

// Fonts with Latin and Cyrillic (Windows, macOS, Linux); the first one found is used for captions
interface CaptionFont {
  file: string;
  family: string;      // the name the `ass` filter looks the font up by
}
const CAPTION_FONTS: CaptionFont[] = [
  { file: 'C:/Windows/Fonts/segoeui.ttf',                          family: 'Segoe UI' },
  { file: 'C:/Windows/Fonts/arial.ttf',                            family: 'Arial' },
  { file: '/System/Library/Fonts/Supplemental/Arial.ttf',          family: 'Arial' },
  { file: '/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf',   family: 'Noto Sans' },
  { file: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',       family: 'DejaVu Sans' },
];

// Captions use `drawtext` when this ffmpeg has it (Windows), else `ass` (the Linux ffmpeg has libass only)
type TextFilter = 'drawtext' | 'ass' | '';
let textFilter: Promise<TextFilter>;

interface RunningExport {
  cancelled: boolean;
  child: any;
  tempDir: string;
}

const running: Map<string, RunningExport> = new Map();

/**
 * - `choose-export-path` (requestId, suggestedName) => `export-path-chosen` (requestId, path | '')
 * - `start-export` (exportId, ExportJob) => `export-progress` (exportId, ExportProgress) …
 *                                          => `export-finished` (exportId, ExportResult)
 * - `cancel-export` (exportId)
 */
export function setUpExport(ipc): void {

  ipc.on('choose-export-path', async (event, requestId: string, suggestedName: string) => {
    const safeName: string = (suggestedName || 'Compilation').replace(/[\\/:*?"<>|]/g, '_');
    const result = await dialog.showSaveDialog({
      defaultPath: path.join(app.getPath('videos'), safeName + '.mp4'),
      filters: [{ name: 'MP4 video', extensions: ['mp4'] }],
    });
    event.sender.send('export-path-chosen', requestId, result.canceled ? '' : result.filePath);
  });

  ipc.on('start-export', (event, exportId: string, job: ExportJob) => {
    const send = (channel: string, payload: any) => {
      try {
        event.sender.send(channel, exportId, payload);
      } catch {} // window closed
    };
    runExport(exportId, job, (progress: ExportProgress) => send('export-progress', progress))
      .then((result: ExportResult) => send('export-finished', result));
  });

  ipc.on('cancel-export', (event, exportId: string) => {
    const job: RunningExport = running.get(exportId);
    if (job) {
      job.cancelled = true;
      try { job.child && job.child.kill(); } catch {}
    }
  });

  app.on('will-quit', () => {
    running.forEach((job: RunningExport) => {
      job.cancelled = true;
      try { job.child && job.child.kill(); } catch {}
    });
  });
}

/**
 * Convert every clip to the same format (size, frame rate, audio), then join them without re-encoding
 * A clip that fails is skipped -- the rest still make a video
 */
export async function runExport(exportId: string, job: ExportJob, onProgress: (p: ExportProgress) => void): Promise<ExportResult> {
  const tempDir: string = fs.mkdtempSync(path.join(os.tmpdir(), 'vha-export-'));
  const state: RunningExport = { cancelled: false, child: null, tempDir: tempDir };
  running.set(exportId, state);

  const result: ExportResult = { ok: false, cancelled: false, outputPath: job.outputPath, error: '', skipped: [] };
  const totalSeconds: number = job.clips.reduce((sum: number, clip: ExportClip) => sum + clip.duration, 0) || 1;
  const font: CaptionFont = job.captions ? CAPTION_FONTS.find((f: CaptionFont) => fs.existsSync(f.file)) : undefined;
  const captionsWith: TextFilter = font ? await findTextFilter() : '';

  const segments: string[] = [];
  let doneSeconds = 0;

  try {
    for (let i = 0; i < job.clips.length; i++) {
      if (state.cancelled) {
        break;
      }
      const clip: ExportClip = job.clips[i];
      const segmentPath: string = path.join(tempDir, 'clip-' + String(i).padStart(4, '0') + '.mp4');

      onProgress({ fraction: doneSeconds / totalSeconds, clip: i + 1, clipCount: job.clips.length });

      try {
        const hasAudio: boolean = await probeHasAudio(clip.path);
        const caption: string = captionsWith && clip.label
          ? captionFilter(captionsWith, font, clip.label, job, path.join(tempDir, 'caption-' + i))
          : '';
        const convert = (withCaption: string) => runFfmpeg(state, segmentArgs(clip, job, hasAudio, withCaption, segmentPath), (seconds: number) => {
          onProgress({
            fraction: (doneSeconds + Math.min(seconds, clip.duration)) / totalSeconds,
            clip: i + 1,
            clipCount: job.clips.length,
          });
        });
        try {
          await convert(caption);
        } catch (err) {
          if (!caption || state.cancelled) {
            throw err;
          }
          console.log('export: caption failed, converting clip', i + 1, 'without it', err);
          await convert('');
        }
        segments.push(segmentPath);
      } catch (err) {
        if (state.cancelled) {
          break;
        }
        console.log('export: skipping clip', i + 1, clip.path, err);
        result.skipped.push(i + 1);
      }
      doneSeconds += clip.duration;
    }

    if (state.cancelled) {
      result.cancelled = true;
      return result;
    }
    if (!segments.length) {
      result.error = 'none of the clips could be converted';
      return result;
    }

    // join -- every segment has identical settings, so they are copied, not re-encoded
    onProgress({ fraction: 0.99, clip: job.clips.length + 1, clipCount: job.clips.length });
    const listPath: string = path.join(tempDir, 'list.txt');
    fs.writeFileSync(listPath, segments.map((s: string) => "file '" + s.replace(/\\/g, '/').replace(/'/g, "'\\''") + "'").join('\n'), 'utf8');

    const partialPath: string = job.outputPath + '.partial.mp4';
    await runFfmpeg(state, [
      '-hide_banner', '-loglevel', 'error', '-nostdin', '-y',
      '-f', 'concat', '-safe', '0', '-i', listPath,
      '-c', 'copy', '-movflags', '+faststart',
      partialPath,
    ], () => {});
    if (fs.existsSync(job.outputPath)) {
      fs.unlinkSync(job.outputPath); // the save dialog already asked about replacing it
    }
    fs.renameSync(partialPath, job.outputPath);

    result.ok = true;
    onProgress({ fraction: 1, clip: job.clips.length + 1, clipCount: job.clips.length });
    return result;

  } catch (err) {
    result.cancelled = state.cancelled;
    result.error = state.cancelled ? '' : String(err && err.message ? err.message : err);
    try { fs.unlinkSync(job.outputPath + '.partial.mp4'); } catch {}
    return result;

  } finally {
    running.delete(exportId);
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
  }
}

/**
 * ffmpeg arguments for one clip -> uniform H.264 / AAC segment
 */
function segmentArgs(clip: ExportClip, job: ExportJob, hasAudio: boolean, caption: string, output: string): string[] {
  const w: number = job.width;
  const h: number = job.height;

  const video = '[0:v]yadif=deint=interlaced,'
    + `scale=${w}:${h}:force_original_aspect_ratio=decrease,`
    + `pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1,fps=${FPS},format=yuv420p`
    + (caption ? ',' + caption : '')
    + '[v]';

  const audio: string = hasAudio
    ? ';[0:a]aresample=48000,aformat=channel_layouts=stereo,apad[a]'
    : ';[1:a]aformat=channel_layouts=stereo[a]';

  const args: string[] = ['-hide_banner', '-loglevel', 'error', '-nostdin', '-y'];
  if (clip.start > 0) {
    args.push('-ss', clip.start.toFixed(3));
  }
  args.push('-i', clip.path);
  if (!hasAudio) {
    args.push('-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo');
  }
  args.push(
    '-t', clip.duration.toFixed(3),
    '-filter_complex', video + audio,
    '-map', '[v]', '-map', '[a]',
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '20', '-profile:v', 'high', '-r', String(FPS),
    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2',
    '-shortest',
    '-progress', 'pipe:1', '-nostats',
    output,
  );
  return args;
}

/**
 * Filter that shows `label` for the clip's first seconds -- white text on a see-through box, fading out
 * Writes the text (or subtitle) file it needs to `fileBase` + extension
 */
function captionFilter(filter: TextFilter, font: CaptionFont, label: string, job: ExportJob, fileBase: string): string {
  const h: number = job.height;
  const padding: number = Math.round(h / 60);

  if (filter === 'drawtext') {
    const textFile: string = fileBase + '.txt';
    fs.writeFileSync(textFile, label, 'utf8');
    const fade: number = CAPTION_SECONDS - 0.5;
    return 'drawtext='
      + `fontfile='${filterPath(font.file)}':textfile='${filterPath(textFile)}':`
      + `fontsize=h/16:fontcolor=white:box=1:boxcolor=black@0.45:boxborderw=${padding}:`
      + `x=(w-text_w)/2:y=h-text_h-h/10:`
      + `enable='lt(t,${CAPTION_SECONDS})':alpha='if(lt(t,${fade}),1,(${CAPTION_SECONDS}-t)/0.5)'`;
  }

  // ASS: colours are &HAABBGGRR with AA = transparency, so black@0.45 is &H8C000000; BorderStyle 3 = box
  const text: string = label
    .replace(/\\/g, '/')                  // libass reads `\` as the start of a code
    .replace(/[{}]/g, (c: string) => (c === '{' ? '(' : ')'))
    .replace(/\r?\n/g, '\\N');
  const subtitleFile: string = fileBase + '.ass';
  fs.writeFileSync(subtitleFile, [
    '[Script Info]',
    'ScriptType: v4.00+',
    `PlayResX: ${job.width}`,
    `PlayResY: ${h}`,
    'WrapStyle: 0',
    '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, '
      + 'Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, '
      + 'MarginL, MarginR, MarginV, Encoding',
    `Style: Caption,${font.family},${Math.round(h / 16)},&H00FFFFFF,&H00FFFFFF,&H8C000000,&H8C000000,`
      + `0,0,0,0,100,100,0,0,3,${padding},0,2,${padding * 2},${padding * 2},${Math.round(h / 10)},1`,
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
    `Dialogue: 0,0:00:00.00,0:00:0${CAPTION_SECONDS}.00,Caption,,0,0,0,,{\\fad(0,500)}${text}`,
    '',
  ].join('\n'), 'utf8');
  return `ass=filename='${filterPath(subtitleFile)}':fontsdir='${filterPath(path.dirname(font.file))}'`;
}

/**
 * Which caption filter the bundled ffmpeg has -- checked once
 */
function findTextFilter(): Promise<TextFilter> {
  if (!textFilter) {
    textFilter = new Promise((resolve) => {
      execFile(ffmpegPath, ['-hide_banner', '-filters'], { windowsHide: true, timeout: 20000, maxBuffer: 4 * 1024 * 1024 },
        (err, stdout: string) => {
          const has = (name: string): boolean => new RegExp('^\\s*\\S+\\s+' + name + '\\s', 'm').test(stdout || '');
          resolve(has('drawtext') ? 'drawtext' : has('ass') ? 'ass' : '');
        });
    });
  }
  return textFilter;
}

/**
 * A path inside a filtergraph option: forward slashes, `:` and `'` escaped
 */
function filterPath(p: string): string {
  return p.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "'\\\\''");
}

function probeHasAudio(filePath: string): Promise<boolean> {
  return new Promise((resolve) => {
    execFile(ffprobePath, ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', filePath],
      { windowsHide: true, timeout: 20000 },
      (err, stdout: string) => resolve(!err && stdout.trim().length > 0));
  });
}

/**
 * Run ffmpeg; reports seconds converted from `-progress` output; rejects on failure or cancel
 */
function runFfmpeg(state: RunningExport, args: string[], onSeconds: (seconds: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    if (state.cancelled) {
      reject(new Error('cancelled'));
      return;
    }
    const child = spawn(ffmpegPath, args, { windowsHide: true });
    state.child = child;

    let errors = '';
    let buffered = '';
    child.stdout.on('data', (chunk: Buffer) => {
      buffered += chunk.toString();
      const lines: string[] = buffered.split('\n');
      buffered = lines.pop();
      lines.forEach((line: string) => {
        const match = /^out_time_(?:us|ms)=(\d+)/.exec(line.trim());
        if (match) {
          onSeconds(Number(match[1]) / 1e6);
        }
      });
    });
    child.stderr.on('data', (chunk: Buffer) => { errors = (errors + chunk.toString()).slice(-3000); });
    child.on('error', reject);
    child.on('exit', (code: number) => {
      state.child = null;
      if (state.cancelled) {
        reject(new Error('cancelled'));
      } else if (code === 0) {
        resolve();
      } else {
        reject(new Error(errors.trim().split('\n').pop() || ('ffmpeg exited with ' + code)));
      }
    });
  });
}
