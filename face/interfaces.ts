export interface CropBox {
  top: number,
  left: number,
  width: number,
  height: number,
}

export interface InputMeta {
  width: number,
  height: number,
  eachSSwidth: number,
}

// Face API ===============================

export interface FullDetection {
  detection: FaceDetection;
  gender: Gender;
}

export interface FaceDetection {
  _box: FaceBox;
}

export interface FaceBox {
  _x: number;
  _y: number;
  _width: number;
  _height: number;
}

export type Gender = 'male' | 'female';
