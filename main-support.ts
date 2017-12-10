/**
 * Label the video according to these rules
 * 5th item is size (720, 1080, etc)
 * @param width
 * @param height
 */
export function labelVideo(width: number, height: number): string {
  let size = '';
  if (width === 3840 && height === 2160) {
    size = '4k';
  } else if (width === 1920 && height === 1080) {
    size = '1080';
  } else if (width === 1280 && height === 720) {
    size = '720';
  } else if (width > 3840) {
    size = '4K+';
  } else if (width > 1920) {
    size = '1080+';
  } else if (width > 720) {
    size = '720+';
  }
  return size;
}

/**
 * Clean up the file name
 * (1) underscores
 * (2) double spaces / tripple spaces
 * (3) remove filename
 * (4) strip periods
 * @param original {string}
 * @return {string}
 */
export function cleanUpFileName(original: string): string {
  let result = original;

  result = result.split('_').join(' ');                // (1)
  result = result.split('.').slice(0, -1).join('.');   // (3)
  result = result.split('.').join(' ');                // (4)

  result = result.split('   ').join(' ');              // (2)
  result = result.split('  ').join(' ');               // (2)

  return result;
}

/*
// If ever I want a dynamic extraction
const count = 10;
// from https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/issues/449#issuecomment-285759269
const timestamps = [];
const startPositionPercent = 5;
const endPositionPercent = 95;
const addPercent = (endPositionPercent - startPositionPercent) / (count - 1);
// create an array that says ['5%', '15%', '25%', '35%', '45%', '55%', '65%', '75%', '85%', '95%']
if (!timestamps.length) {
  let t = 0;
  while (t < count) {
    timestamps.push(`${startPositionPercent + addPercent * t}%`);
    t = t + 1;
  }
}
// some of the above can be replaced with a simple array
*/
