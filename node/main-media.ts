import { app, protocol } from 'electron';

const fs = require('fs');
const { spawn, execFile } = require('child_process');
const { Readable } = require('stream');

import type { MediaPlan } from '../interfaces/media-plan.interface';

const ffmpegPath: string = require('ffmpeg-static').replace('app.asar', 'app.asar.unpacked');
const ffprobePath: string = require('@ffprobe-installer/ffprobe').path.replace('app.asar', 'app.asar.unpacked');

// The built-in player (Chromium) plays these directly; anything else is converted while it plays
const DIRECT_CONTAINERS: RegExp = /mov|mp4|matroska|webm|ogg/;
// Chromium on Linux decodes HEVC only through VA-API, which usually fails, so it is converted there
const DIRECT_VIDEO: string[] = ['h264', 'vp8', 'vp9', 'av1', 'theora'].concat(process.platform === 'linux' ? [] : ['hevc']);
const DIRECT_AUDIO: string[] = ['aac', 'mp3', 'opus', 'vorbis', 'flac'];
const COPYABLE_AUDIO: string[] = ['aac', 'mp3']; // can go into the converted stream untouched

export const MEDIA_SCHEME = 'vha-media';

const planCache: Map<string, MediaPlan> = new Map();
const streams: Map<string, any> = new Map(); // stream id (one per player slot) => ffmpeg process

/**
 * Must run before the app is ready
 */
export function registerMediaScheme(): void {
  protocol.registerSchemesAsPrivileged([{
    scheme: MEDIA_SCHEME,
    privileges: { standard: true, secure: true, stream: true, supportFetchAPI: true, bypassCSP: true, corsEnabled: true },
  }]);
}

/**
 * Must run once the app is ready
 *  - `please-plan-media` (requestId, path) => `media-plan-returning` (requestId, MediaPlan)
 *  - `vha-media://stream/?path=…&start=…&duration=…&id=…&audio=copy|aac` streams a converted fragmented MP4
 */
export function setUpMediaPlayback(ipc): void {

  ipc.on('please-plan-media', (event, requestId: string, filePath: string): void => {
    planMedia(filePath).then((plan: MediaPlan) => {
      try {
        event.sender.send('media-plan-returning', requestId, plan);
      } catch {} // window closed meanwhile
    });
  });

  ipc.on('stop-media-stream', (event, id: string): void => stopStream(id));

  ipc.on('stop-all-media-streams', (): void => stopAllStreams());

  app.on('will-quit', stopAllStreams);

  protocol.handle(MEDIA_SCHEME, (request: Request): Response => {
    const url = new URL(request.url);
    const filePath: string = url.searchParams.get('path');
    const start: number = Number(url.searchParams.get('start')) || 0;
    const duration: number = Number(url.searchParams.get('duration')) || 0;
    const id: string = url.searchParams.get('id') || 'default';
    const copyAudio: boolean = url.searchParams.get('audio') === 'copy';

    if (!filePath || !fs.existsSync(filePath)) {
      return new Response('not found', { status: 404 });
    }

    stopStream(id); // the slot is moving on -- one conversion per slot

    const child = spawn(ffmpegPath, streamArgs(filePath, start, duration, copyAudio), { windowsHide: true });
    streams.set(id, child);

    let errors = '';
    child.stderr.on('data', (chunk: Buffer) => { errors = (errors + chunk.toString()).slice(-2000); });
    child.on('exit', (code: number) => {
      if (streams.get(id) === child) {
        streams.delete(id);
      }
      if (code) {
        console.log('media stream ended with', code, filePath, errors);
      }
    });
    child.stdout.on('error', () => {}); // player let go of the stream -- EPIPE is expected

    return new Response(Readable.toWeb(child.stdout), {
      headers: { 'Content-Type': 'video/mp4', 'Cache-Control': 'no-store' },
    });
  });
}

/**
 * Decide whether a file plays directly or needs converting -- cached per path
 */
function planMedia(filePath: string): Promise<MediaPlan> {
  if (planCache.has(filePath)) {
    return Promise.resolve(planCache.get(filePath));
  }

  const args: string[] = [
    '-v', 'error',
    '-show_entries', 'format=format_name:stream=codec_type,codec_name,pix_fmt:stream_disposition=attached_pic',
    '-of', 'json',
    filePath,
  ];

  return new Promise((resolve) => {
    execFile(ffprobePath, args, { windowsHide: true, timeout: 15000, maxBuffer: 1024 * 1024 }, (err, stdout: string) => {
      let plan: MediaPlan;
      try {
        if (err) {
          throw err;
        }
        plan = decide(JSON.parse(stdout));
      } catch (e) {
        // could not probe -- let the player try it directly; it falls back to converting on error
        plan = { mode: 'direct', copyAudio: false, reason: 'probe failed' };
      }
      planCache.set(filePath, plan);
      resolve(plan);
    });
  });
}

function decide(probe: any): MediaPlan {
  const container: string = (probe.format && probe.format.format_name) || '';
  const streamsFound: any[] = probe.streams || [];
  const video: any = streamsFound.find(s => s.codec_type === 'video' && !(s.disposition && s.disposition.attached_pic));
  const audio: any = streamsFound.find(s => s.codec_type === 'audio');

  const videoCodec: string = video ? video.codec_name : '';
  const audioCodec: string = audio ? audio.codec_name : '';
  const pixFmt: string = (video && video.pix_fmt) || '';

  // Chromium decodes 8-bit 4:2:0 H.264 only; HEVC 10-bit goes through the GPU
  const videoOk: boolean = !video || (DIRECT_VIDEO.includes(videoCodec) && !(videoCodec === 'h264' && /10|12|422|444/.test(pixFmt)));
  const audioOk: boolean = !audio || DIRECT_AUDIO.includes(audioCodec);
  const containerOk: boolean = DIRECT_CONTAINERS.test(container);

  const reason: string = [container, videoCodec, pixFmt, audioCodec].filter(Boolean).join(' / ');

  return {
    mode: containerOk && videoOk && audioOk ? 'direct' : 'stream',
    copyAudio: COPYABLE_AUDIO.includes(audioCodec),
    reason: reason,
  };
}

/**
 * Convert to H.264 / AAC in fragmented MP4, which <video> plays while it is still being written
 * - fast start: no B-frames or look-ahead, a keyframe (and so a fragment) every 15 frames
 * - capped at 1080p; interlaced camera footage is deinterlaced
 */
function streamArgs(filePath: string, start: number, duration: number, copyAudio: boolean): string[] {
  const args: string[] = ['-hide_banner', '-loglevel', 'error', '-nostdin'];
  if (start > 0) {
    args.push('-ss', start.toFixed(3));
  }
  args.push('-i', filePath);
  if (duration > 0) {
    args.push('-t', duration.toFixed(3));
  }
  args.push(
    '-map', '0:v:0', '-map', '0:a:0?',
    '-c:v', 'libx264', '-preset', 'veryfast', '-tune', 'zerolatency', '-crf', '21', '-pix_fmt', 'yuv420p',
    '-vf', 'yadif=deint=interlaced,scale=\'trunc(min(1920,iw)/2)*2\':-2',
    '-g', '15', '-keyint_min', '15', '-sc_threshold', '0',
  );
  if (copyAudio) {
    args.push('-c:a', 'copy');
  } else {
    args.push('-c:a', 'aac', '-b:a', '192k', '-ac', '2');
  }
  args.push('-movflags', 'frag_keyframe+empty_moov+default_base_moof', '-f', 'mp4', 'pipe:1');
  return args;
}

function stopStream(id: string): void {
  const child = streams.get(id);
  if (child) {
    streams.delete(id);
    try { child.kill(); } catch {}
  }
}

function stopAllStreams(): void {
  Array.from(streams.keys()).forEach((id: string) => stopStream(id));
}
