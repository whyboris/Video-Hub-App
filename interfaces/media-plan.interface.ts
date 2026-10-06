// How the built-in player should play a file -- decided in node from an ffprobe of the file

export interface MediaPlan {
  mode: 'direct' | 'stream';   // `direct`: <video src="file://…">; `stream`: converted by ffmpeg while it plays
  copyAudio: boolean;          // when streaming, the audio needs no conversion
  reason: string;              // container / codecs found -- for diagnostics
}
