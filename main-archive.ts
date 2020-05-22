// ========================================================================================
//         Disabled method -- came from `main-extract.ts`
// ========================================================================================

/**
 * Check whether screenshots can be extracted from video file
 * To prevent erroring when file is corrupt
 *
 * Method currently disabled because it takes too long:
 * For 15 screenshots, it takes 1 - 6 seconds to check if the file is not corrupt
 * This is too long to wait during a regular extraction process
 * since 99% of the files will not be corrupt
 *
 * Furthermore, it does not seem to catch all corrupt files anyway
 *
 * The current solution is simply to kill every ffmpeg process after some time
 * in case it is stuck trying to parse an unparsable file
 *
 * Used to be after step 1 (checking video file still present)
 *
        //   return checkAllScreensExist(pathToVideo, duration, numOfScreens);
        // })

        // .then(content => {
        //   console.log('1.5 - all screenshots present = ' + content);

        //   if (content === false) {
        //     throw new Error('FILE MIGHT BE CORRUPT');
        //   }
 *
 * @param pathToVideo
 * @param duration
 * @param numberOfScreenshots
 */
const checkAllScreensExist__DISABLED = (
  pathToVideo: string,
  duration: number,
  numberOfScreenshots: number,
) => {

  return new Promise((resolve, reject) => {

    const t0: number = performance.now();

    const totalCount = numberOfScreenshots;
    const step: number = duration / (totalCount + 1);

    // check for complete file
    const check = (current: number): void => {
      if (current === totalCount) {
        console.log('resolving TRUE');

        const t1: number = performance.now();
        console.log('SS check: ' + (t1 - t0).toString());

        return resolve(true);
      }

      const time = (current + 1) * step; // +1 so we don't pick the 0th frame
      const corruptRegex = /Output file is empty, nothing was encoded/g;

      const args = [
        '-v', 'warning', '-ss', time, '-t', '1', '-i', pathToVideo, '-map', 'V', '-f', 'null', '-',
      ];
      // console.log('extracting clip frame 1');
      const ffmpeg_process = spawn(ffmpegPath, args);
      // Note from past Cal to future Cal:
      // ALWAYS READ THE DATA, EVEN IF YOU DO NOTHING WITH IT
      ffmpeg_process.stdout.on('data', data => {
        if (GLOBALS.debug) {
          console.log(data);
          if (data.match(corruptRegex)) {
            // skip this file
            console.log(pathToVideo + ' was corrupt, skipping!');
            return resolve(false);
          }
        }
      });
      ffmpeg_process.stderr.on('data', data => {
        if (GLOBALS.debug) {
          console.log('grep stderr: ' + data);
          if (data.match(corruptRegex)) {
            console.log(pathToVideo + ' was corrupt, skipping!');
            return resolve(false);
          }
          return resolve(false);
        }
      });
      ffmpeg_process.on('exit', () => {
        check(current + 1);
      });
    };
    check(0);
  });

};
