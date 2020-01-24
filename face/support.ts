import { CropBox, InputMeta } from './interfaces';

/**
 * Take cropping box and expand it to include more of the face !!!
 * @param box
 * @param sizes
 */
export function getBetterBox(box, sizes: InputMeta): CropBox {

  // set y to 1/2 height heigher or 0
  const new_y: number = (Math.round(box._y) - Math.round(box._height / 2)) < 0 ? 0 : (Math.round(box._y) - Math.round(box._height / 2));

  // set x to 1/2 to the left or 0
  const new_x: number = (Math.round(box._x) - Math.round(box._width / 2)) < 0 ? 0 : (Math.round(box._x) - Math.round(box._width / 2));

  // make width 2x wider or until it hits right edge
  const new_w: number = (new_x + Math.round(box._width * 2)) > sizes.eachSSwidth ? sizes.eachSSwidth - new_x : (Math.round(box._width * 2));

  // make height 2x as tall or until it hits bottom of image
  const new_h: number = (new_y + Math.round(box._height * 2)) > sizes.height ? sizes.height - new_y : (Math.round(box._height * 2));

  return {
    top: new_y,
    left: new_x,
    width: new_w,
    height: new_h,
  };

}
