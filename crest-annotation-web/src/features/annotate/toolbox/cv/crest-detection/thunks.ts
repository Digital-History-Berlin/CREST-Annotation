import {
  CvCrestDetectionToolConfig,
  CvCrestDetectionToolOperation,
  CvCrestDetectionToolState,
  SamMask,
  toolState,
} from "./types";
import { cvGet, cvPrepare } from "../../../../../api/cvApi";
import { Tool, ToolStatus } from "../../../types/toolbox";
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

// show a mask with for given index
export const navigateMaskIndex: ToolboxThunk<{ index: number }> = (
  { index },
  thunkApi
) => {
  const { backend, algorithm, config, data } = toolState(thunkApi.getState());

  if (data?.boundingBoxes === undefined)
    throw new Error("Bounding boxes not found");
  if (data.boundingBoxes.length <= index)
    // TODO: complete selection process
    return;

  const operation: CvCrestDetectionToolOperation = {
    type: "tool/cv/crest-detection",
    state: {
      tool: Tool.Cv,
      index,
      boundingBox: data.boundingBoxes[index],
    },
  };

  // begin a new mask selection operation
  return withBeginOperationContext<CvCrestDetectionToolOperation>(
    operation,
    { thunkApi },
    async (contextApi) => {
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

export const select = createCustomToolThunk<{ index: number }>(
  "toolbox/cv/crestDetection/select",
  Tool.Cv,
  navigateMaskIndex
);

export const decide = createCustomToolThunk<{
  accept: boolean;
  proceed?: boolean;
}>("toolbox/cv/crestDetection/decide", Tool.Cv, async ({ proceed }, thunkApi) =>
  withCurrentOperationContext<CvCrestDetectionToolOperation>(
    { thunkApi, type: "tool/cv/crest-detection" },
    (contextApi) => {
      const { state } = contextApi.getState();
      // complete the current operation
      contextApi.complete();

      if (proceed) navigateMaskIndex({ index: state.index + 1 }, thunkApi);
    }
  )
);
