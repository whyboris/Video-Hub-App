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
*/