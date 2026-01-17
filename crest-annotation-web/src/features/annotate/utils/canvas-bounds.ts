import { Translation } from "../../../types/geometry";

export interface ImageSize {
  width: number;
  height: number;
}

export interface ClientSize {
  clientWidth: number;
  clientHeight: number;
}

/**
 * Scale a size by the given factor
 */
export const scaleSize = (size: ImageSize, scale: number) => ({
  width: size.width * scale,
  height: size.height * scale,
});

/**
 * Clamps a translation to keep the image within bounds.
 *
 * Center the image if it fits insie the container,
 * otherwise keep the edges within bounds.
 */
export const translateBounds = (
  { x, y }: Translation,
  { width, height }: ImageSize,
  { clientWidth, clientHeight }: ClientSize
): Translation => {
  if (width <= clientWidth) {
    x = (clientWidth - width) / 2;
  } else {
    const minX = clientWidth - width;
    const maxX = 0;
    x = Math.max(minX, Math.min(maxX, x));
  }

  if (height <= clientHeight) {
    y = (clientHeight - height) / 2;
  } else {
    const minY = clientHeight - height;
    const maxY = 0;
    y = Math.max(minY, Math.min(maxY, y));
  }

  return { x, y };
};
