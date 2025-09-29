const sharp = require('sharp');

import { getBetterBox } from './support';

import { InputMeta, FullDetection, FaceBox, Gender } from './interfaces';

// ====== METHODS ==================================================================================

/**
 * Inspect original image, return the width, height, and width of each sub-image
 * Later Video Hub App will just provide these 3 pieces of data
 * @param imgPath
 * @param numOfScreens
 */
export async function getImageSizes(imgPath: string, numOfScreens: number): Promise<InputMeta> {
  const fileMeta = await sharp(imgPath).metadata();

  return {
    width: fileMeta.width,
    height: fileMeta.height,
    eachSSwidth: fileMeta.width / numOfScreens
  };
}


/**
 * Extract buffer from sub-image
 * @param offset number of pixels offset in original image (for when you have many sub-images horizontally)
 * @param width width of the (sub-) image
 * @param sizes
 * @param imgPath
 */
export async function getSubImageBuffer(offset: number, width: number, sizes: InputMeta, imgPath: string): Promise<Buffer> {
  const imgBuffer: Buffer = await sharp(imgPath)
    .extract({
      left: offset,
      top: 0,
      width: width,
      height: sizes.height,
    })
    .toBuffer();

  return imgBuffer;
}


/**
 * Return the cropped buffer
 * @param imgBuffer
 * @param match
 * @param sizes
 */
export async function getFaceCropBuffer(imgBuffer: Buffer, match: FaceBox, sizes: InputMeta) {

  const newBox = getBetterBox(match, sizes);

  console.log(newBox);

  const croppedImageBuffer = await sharp(imgBuffer)
    .extract(newBox)
    .resize(sizes.eachSSwidth / 2, sizes.height)
    .toBuffer();

  return croppedImageBuffer;
}


/**
 * Save each face in the current image
 *   - when there is more than one face found in an image
 *
 * @param matches
 * @param imgBuffer
 * @param sizes
 *
 * @returns array of buffers !!!
 */
export async function getCroppedImageBuffers(matches: FullDetection[], imgBuffer: Buffer, sizes: InputMeta, gender: Gender) {

  console.log('found', matches.length, 'faces');

  const all_faces = [];

  for (let i = 0; i < matches.length; i++) {
    const box: FaceBox = matches[i].detection._box;
    const sex: Gender = matches[i].gender;
    if (sex === gender) {
      const croppedBuffer = await getFaceCropBuffer(imgBuffer, box, sizes);
      all_faces.push(croppedBuffer);
    }
  }

  return all_faces;
}


/**
 * Iteracte across face-crop-buffers, combine them into a single photo, and save as output
 * @param allFaceBuffers
 * @param outputFile
 * @param sizes
 */
export function saveFinalOutput(allFaceBuffers: Buffer[], outputFile: string, sizes: InputMeta) {

  console.log('Total of', allFaceBuffers.length, 'faces found!');

  let tracker = 0;

  const composeParams = [];

  allFaceBuffers.forEach((face) => {
    composeParams.push({
      input: allFaceBuffers[tracker],
      top: 0,
      left: tracker * sizes.eachSSwidth / 2,
    });
    tracker++;
  });

  sharp({
    create: {
      width: tracker * sizes.eachSSwidth / 2,
      height: sizes.height,
      channels: 3,
      background: { r: 0, g: 0, b: 50 }
    }
  })
  .composite(composeParams)
  .toFile(outputFile);
}
