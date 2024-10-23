const tf = require('@tensorflow/tfjs-node');

const faceapi = require('face-api.js');

import { FullDetection } from './interfaces';

/**
 * Load the model only once
 */
export async function loadModel() {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk('./weights');
  await faceapi.nets.ageGenderNet.loadFromDisk('./weights');
  // await faceapi.nets.faceLandmark68Net.loadFromDisk('./weights');
  // await faceapi.nets.tinyFaceDetector.loadFromDisk('./weights'); // NOT VERY GOOD, but fast
}

/**
 * Use face-api.js to detect a rectangle around the face
 * @param imgBuffer
 */
export async function findTheFaces(imgBuffer: Buffer): Promise<FullDetection[]> {

  const imgTensor = tf.node.decodeJpeg(imgBuffer);

  // const detections = await faceapi.detectAllFaces(imgElement);
  // const detections = await faceapi.detectAllFaces(imgElement, new faceapi.TinyFaceDetectorOptions());
  const detections = await faceapi.detectAllFaces(imgTensor).withAgeAndGender(); // changes output format a bit

  // console.log(detections);

  return detections;
}
