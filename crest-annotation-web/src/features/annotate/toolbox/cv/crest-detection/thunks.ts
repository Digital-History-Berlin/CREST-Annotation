import { v4 as uuidv4 } from "uuid";
import {
  CvCrestDetectionToolConfig,
  CvCrestDetectionToolOperation,
  CvCrestDetectionToolState,
  SamBoundingBox,
  SamMask,
  defaultConfig,
  toolState,
} from "./types";
import { cvGet, cvPrepare } from "../../../../../api/cvApi";
import { Label } from "../../../../../api/openApi";
import { MaskShape } from "../../../components/shapes/Mask";
import { RectangleShape } from "../../../components/shapes/Rectangle";
import { Annotation, addAnnotation } from "../../../slice/annotations";
import { ShapeType } from "../../../types/shapes";
import { Tool, ToolStateError, ToolStatus } from "../../../types/toolbox";
import { ToolboxThunk } from "../../../types/toolbox-thunks";
import {
  createActivateThunk,
  createConfigureThunk,
  createCustomToolThunk,
  withBeginOperationContext,
  withCurrentOperationContext,
} from "../../create-custom-tool";
import { cvCreateLoaderThunk } from "../create-cv-tool";
import { CvAlgorithm, CvBackendConfig } from "../types";

export const toRectShape = (boundingBox: SamBoundingBox): RectangleShape => ({
  type: ShapeType.Rectangle,
  x: boundingBox.bbox[0],
  y: boundingBox.bbox[1],
  width: boundingBox.bbox[2],
  height: boundingBox.bbox[3],
});

export const toMaskShape = (mask: SamMask): MaskShape => ({
  type: ShapeType.Mask,
  mask: mask.mask,
  width: mask.mask[0].length,
  height: mask.mask.length,
  dx: 0,
  dy: 0,
  preview: true,
});

const prepare = cvCreateLoaderThunk<CvCrestDetectionToolState>(
  { name: "Waiting for backend..." },
  async ({ config, image }, { dispatchToolState }, contextApi, thunkApi) => {
    const { backend, algorithm } = toolState(thunkApi.getState(), false);

    console.log("Preparing crest-detection...");
    // clear the previous state
    dispatchToolState({
      status: ToolStatus.Loading,
      config,
      data: undefined,
    });

    // TODO: provide configuration and update on return
    await cvPrepare(backend.url, algorithm, { url: image });
    const response = await cvGet(backend.url, algorithm, "bounding-boxes");
    const boundingBoxes = await response.json();

    // initialization successful
    dispatchToolState({
      status: ToolStatus.Ready,
      config,
      data: { boundingBoxes },
    });
  }
);

export const activate = createActivateThunk<CvCrestDetectionToolState>(
  { tool: Tool.Cv },
  (state, thunkApi) =>
    prepare({ state, config: state?.config || defaultConfig }, thunkApi)
);

export const configure = createConfigureThunk<
  CvCrestDetectionToolState,
  CvCrestDetectionToolConfig
>({ tool: Tool.Cv }, (state, config, thunkApi) =>
  prepare({ state, config }, thunkApi)
);

const cvGetMask = async (
  backend: CvBackendConfig,
  algorithm: CvAlgorithm,
  index: number
): Promise<SamMask> => {
  const response = await cvGet(backend.url, algorithm, `mask/${index}`);
  return await response.json();
};

const calculateOverlap = (
  other: RectangleShape,
  boundingBox: SamBoundingBox
): number => {
  const totalArea =
    other.width * other.height + boundingBox.bbox[2] * boundingBox.bbox[3];
  const [l, r, t, b] = [
    Math.max(other.x, boundingBox.bbox[0]),
    Math.min(other.x + other.width, boundingBox.bbox[0] + boundingBox.bbox[2]),
    Math.max(other.y, boundingBox.bbox[1]),
    Math.min(other.y + other.height, boundingBox.bbox[1] + boundingBox.bbox[3]),
  ];
  const sharedArea = Math.max(0, r - l) * Math.max(0, b - t);
  return sharedArea / totalArea;
};

const calculateCoverage = (
  other: RectangleShape,
  boundingBox: SamBoundingBox
): number => {
  const totalArea = boundingBox.bbox[2] * boundingBox.bbox[3];
  const [l, r, t, b] = [
    Math.max(other.x, boundingBox.bbox[0]),
    Math.min(other.x + other.width, boundingBox.bbox[0] + boundingBox.bbox[2]),
    Math.max(other.y, boundingBox.bbox[1]),
    Math.min(other.y + other.height, boundingBox.bbox[1] + boundingBox.bbox[3]),
  ];
  const sharedArea = Math.max(0, r - l) * Math.max(0, b - t);
  return sharedArea / totalArea;
};

const calculateRating = (
  boundingBox: SamBoundingBox,
  config: CvCrestDetectionToolConfig,
  annotations: Annotation[]
): number => {
  for (const annotation of annotations) {
    const shapes = annotation.shapes || [];
    for (const shape of shapes) {
      if (
        config.skipDuplicates &&
        shape.type === ShapeType.Rectangle &&
        calculateOverlap(shape as RectangleShape, boundingBox) >
          config.overlapThreshold
      )
        return 0.0;
      if (
        config.skipCovered &&
        shape.type === ShapeType.Rectangle &&
        calculateCoverage(shape as RectangleShape, boundingBox) >
          config.coverageThreshold
      )
        return 0.0;
    }
  }

  return 1.0;
};

// show a mask with for given index
export const navigateMaskIndex: ToolboxThunk<{
  index: number;
  label: Label;
}> = ({ index, label }, thunkApi) => {
  const { backend, algorithm, config, data } = toolState(thunkApi.getState());

  if (config === undefined)
    throw new ToolStateError(Tool.Cv, "Configuration not found");
  if (data?.boundingBoxes === undefined)
    throw new ToolStateError(Tool.Cv, "Bounding boxes not found");

  // automatically skip unlikely masks
  const { annotations } = thunkApi.getState().annotations;
  while (
    index < data.boundingBoxes.length &&
    calculateRating(data.boundingBoxes[index], config, annotations) < 0.5
  )
    index++;

  if (index >= data.boundingBoxes.length)
    return console.log("All masks annotated");

  const boundingBox = data.boundingBoxes[index];
  const operation: CvCrestDetectionToolOperation = {
    type: "tool/cv/crest-detection",
    state: { tool: Tool.Cv, index, label, boundingBox },
  };

  // begin a new mask selection operation
  return withBeginOperationContext<CvCrestDetectionToolOperation>(
    operation,
    { thunkApi },
    async (contextApi) => {
      // TODO: align centered on canvas
      /*
      contextApi.dispatch(
        updateTransformation({
          center: {
            x: boundingBox.bbox[0] + boundingBox.bbox[2] / 2,
            y: boundingBox.bbox[1] + boundingBox.bbox[3] / 2,
          },
          scale: 1.0,
        })
      );
      */
      // download the mask
      if (config?.showPixelMask) {
        contextApi.progress("Downloading mask...");
        const mask = await cvGetMask(backend, algorithm, index);
        const { state } = contextApi.getState();
        contextApi.state({ ...state, mask });
      }
    }
  );
};

export const select = createCustomToolThunk<{ index: number; label: Label }>(
  "toolbox/cv/crestDetection/select",
  Tool.Cv,
  navigateMaskIndex
);

export const edit = createCustomToolThunk<void>(
  "toolbox/cv/crestDetection/select",
  Tool.Cv,
  async (_, thunkApi) =>
    withCurrentOperationContext<CvCrestDetectionToolOperation>(
      { thunkApi, type: "tool/cv/crest-detection" },
      async (contextApi) => {
        const { state } = contextApi.getState();
        contextApi.state({ ...state, edit: !state.edit });
      }
    )
);

export const update = createCustomToolThunk<{ shape: RectangleShape }>(
  "toolbox/cv/crestDetection/select",
  Tool.Cv,
  async ({ shape }, thunkApi) =>
    withCurrentOperationContext<CvCrestDetectionToolOperation>(
      { thunkApi, type: "tool/cv/crest-detection" },
      async (contextApi) => {
        const { state } = contextApi.getState();
        contextApi.state({
          ...state,
          boundingBox: {
            ...state.boundingBox,
            bbox: [shape.x, shape.y, shape.width, shape.height],
          },
        });
      }
    )
);

export const decide = createCustomToolThunk<{
  accept: boolean;
  proceed?: boolean;
}>(
  "toolbox/cv/crestDetection/decide",
  Tool.Cv,
  async ({ accept, proceed }, thunkApi) =>
    withCurrentOperationContext<CvCrestDetectionToolOperation>(
      { thunkApi, type: "tool/cv/crest-detection" },
      async (contextApi) => {
        const { state } = contextApi.getState();

        if (accept && state.label !== undefined)
          contextApi.dispatch(
            addAnnotation({
              id: uuidv4(),
              shapes: [toRectShape(state.boundingBox)],
              label: state.label,
            })
          );

        // complete the current operation
        await contextApi.complete();

        // proceed with next mask
        if (proceed)
          navigateMaskIndex(
            { index: state.index + 1, label: state.label },
            thunkApi
          );
      }
    )
);
