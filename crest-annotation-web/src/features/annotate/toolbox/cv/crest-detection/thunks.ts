import {
  CvCrestDetectionToolConfig,
  CvCrestDetectionToolOperation,
  CvCrestDetectionToolOperationState,
  CvCrestDetectionToolState,
  SamMask,
} from "./types";
import { cvGet, cvPrepare } from "../../../../../api/cvApi";
import { operationChainWithAsync } from "../../../slice/operation";
import { Tool, ToolStateError, ToolStatus } from "../../../types/toolbox";
import { createActivateThunk, createConfigureThunk } from "../../custom-tool";
import {
  cvCreateCustomThunk,
  cvCreateLoaderThunk,
  cvToolState,
} from "../cv-tool";
import { CvAlgorithm, CvBackendConfig } from "../types";

const prepare = cvCreateLoaderThunk<CvCrestDetectionToolState>(
  { name: "Waiting for backend..." },
  async ({ state, config, image }, thunkApi, { dispatchToolState }) => {
    console.log("Preparing crest-detection...");
    // clear the previous state
    dispatchToolState({
      status: ToolStatus.Loading,
      config,
      data: undefined,
    });

    if (!state?.backend || state.algorithm?.frontend !== "crest-detection")
      throw new ToolStateError(Tool.Cv, state);

    // TODO: provide configuration and update on return
    await cvPrepare(state.backend.url, state.algorithm, { url: image });
    const response = await cvGet(
      state.backend.url,
      state.algorithm,
      "bounding-boxes"
    );

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
  (state, thunkApi) => prepare({ state, config: state?.config }, thunkApi)
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

const _maskRate = () => {
  return 0.5;
};

export const select = cvCreateCustomThunk<
  { index: number },
  CvCrestDetectionToolOperation
>(
  "toolbox/cv/crestDetection/select",
  { task: "cv/crest-detection/select" },
  async ({ index }, operation, { dispatch, getState }) => {
    const { backend, algorithm, config, data } =
      cvToolState<CvCrestDetectionToolState>(getState(), "crest-detection");

    if (!data?.boundingBoxes || data.boundingBoxes.length === 0)
      return console.warn("No bounding boxes detected");

    const state: CvCrestDetectionToolOperationState = {
      tool: Tool.Cv,
      task: "cv/crest-detection/select",
      index,
      boundingBox: data.boundingBoxes[index],
    };

    operationChainWithAsync<CvCrestDetectionToolOperation>(
      { dispatch },
      operation,
      { type: "tool/cv", state },
      async ({ update }) => {
        if (config?.showPixelMask) {
          update({ type: "tool/cv", name: "Downloading mask...", state });
          const mask = await cvGetMask(backend, algorithm, index);
          // show the mask as soon as it is available
          // (only if operation is still active)
          update({ type: "tool/cv", state: { ...state, mask } });
        }
      }
    );
  }
);

export const decide = cvCreateCustomThunk<
  { accept: boolean; proceed?: boolean },
  CvCrestDetectionToolOperation
>(
  "toolbox/cv/crestDetection/decide",
  { task: "cv/crest-detection/select" },
  async ({ proceed }, operation, { dispatch }) => {
    if (!operation) return console.error("Invalid state");
    // proceed with next mask
    if (proceed) dispatch(select({ index: operation.state.index + 1 }));
  }
);
