import { loadModel, findTheFaces } from './detect';
import { getImageSizes, getSubImageBuffer, getCroppedImageBuffers, saveFinalOutput } from './sharp';
import { InputMeta, FullDetection, Gender } from './interfaces';

// VARIABLES for now ===============================================================================

const RELATIVE_IMAGE_PATH = './images/bbt4.jpg';
const CURRENT_NUMBER_OF_SCREENS = 1;  // the number of chunks the image is split into (20 screenshots for example) // HARDCODED FOR NOW
const OUTPUT_FILE_NAME = './output/bbt.jpg';
const GENDER = 'female';

// runEverything(RELATIVE_IMAGE_PATH, CURRENT_NUMBER_OF_SCREENS, OUTPUT_FILE_NAME, GENDER);

// ==== PIPELINE ===================================================================================

/**
 * Full pipeline process
 * @param inputFile  - relative path to INPUT image
 * @param numOfScreens - the number of screenshots in the filmstrip
 * @param outputFile - relative path to OUTPUT image
 */
export async function runEverything(inputFile: string, numOfScreens: number, outputFile: string, gender: Gender) {

  await loadModel();

  const sizes: InputMeta = await getImageSizes(inputFile, numOfScreens);

  console.log(sizes);

  const all_faces = [];

  for (let i = 0; i < sizes.width; i = i + sizes.eachSSwidth) {

    const imgBuffer: Buffer = await getSubImageBuffer(i, sizes.eachSSwidth, sizes, inputFile);

    const detections: FullDetection[] = await findTheFaces(imgBuffer);

    // warning -- getCroppedImageBuffers returns an array (possibly empty)
    // so use `...` spread operator - it will not add any elements if incoming array is empty
    all_faces.push(...(await getCroppedImageBuffers(detections, imgBuffer, sizes, gender)));

  }

  if (all_faces.length) {
    saveFinalOutput(all_faces, outputFile, sizes);
    console.log('File saved:', outputFile);
  } else {
    console.log('no faces found!');
  }
}
