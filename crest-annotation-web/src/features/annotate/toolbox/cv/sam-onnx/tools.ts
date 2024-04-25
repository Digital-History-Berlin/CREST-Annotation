import { Tensor } from "onnxruntime-web";
import { SamImageDimensions, SamInput } from "./types";

export const samOnnxFeeds = ({ clicks, tensor, dimensions }: SamInput) => {
  const imageEmbedding = tensor;
  let pointCoords;
  let pointLabels;
  let pointCoordsTensor;
  let pointLabelsTensor;

  // check there are input click prompts
  if (clicks) {
    const n = clicks.length;

    // if there is no box input, a single padding point with
    // label -1 and coordinates (0.0, 0.0) should be concatenated,
    // so initialize the array to support (n + 1) points
    pointCoords = new Float32Array(2 * (n + 1));
    pointLabels = new Float32Array(n + 1);

    // Add clicks and scale to what SAM expects
    for (let i = 0; i < n; i++) {
      pointCoords[2 * i] = clicks[i].x * dimensions.scale;
      pointCoords[2 * i + 1] = clicks[i].y * dimensions.scale;
      pointLabels[i] = clicks[i].clickType;
    }

    // add in the extra point/label when only clicks and no box
    // the extra point is at (0, 0) with label -1
    pointCoords[2 * n] = 0.0;
    pointCoords[2 * n + 1] = 0.0;
    pointLabels[n] = -1.0;

    // create the tensor
    pointCoordsTensor = new Tensor("float32", pointCoords, [1, n + 1, 2]);
    pointLabelsTensor = new Tensor("float32", pointLabels, [1, n + 1]);
  }

  const imageSizeTensor = new Tensor("float32", [
    dimensions.height,
    dimensions.width,
  ]);

  if (pointCoordsTensor === undefined || pointLabelsTensor === undefined)
    throw new Error("Invalid model input");

  // there is no previous mask, so default to an empty tensor
  const maskInput = new Tensor(
    "float32",
    new Float32Array(256 * 256),
    [1, 1, 256, 256]
  );

  // there is no previous mask, so default to 0
  const hasMaskInput = new Tensor("float32", [0]);

  return {
    image_embeddings: imageEmbedding,
    point_coords: pointCoordsTensor,
    point_labels: pointLabelsTensor,
    orig_im_size: imageSizeTensor,
    mask_input: maskInput,
    has_mask_input: hasMaskInput,
  };
};

export const samDimensionsFromImage = (
  image: HTMLImageElement,
  maxSize = 1024
): SamImageDimensions => {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const scale = maxSize / Math.max(width, height);

  return { width, height, scale };
};

export const samDimensionsFromUrl = (
  url: string,
  maxSize = 1024
): Promise<SamImageDimensions> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = () => resolve(samDimensionsFromImage(image, maxSize));
    image.onerror = (error) => reject(error);
  });
};
