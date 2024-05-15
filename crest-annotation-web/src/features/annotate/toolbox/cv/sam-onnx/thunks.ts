import npyjs from "npyjs";
import { InferenceSession } from "onnxruntime-web";
import * as ort from "onnxruntime-web";
import { samDimensionsFromUrl, samOnnxFeeds } from "./tools";
import {
  CvSamOnnxToolConfig,
  CvSamOnnxToolData,
  CvSamOnnxToolOperation,
  CvSamOnnxToolState,
} from "./types";
import { cvPrepare } from "../../../../../api/cvApi";
import {
  Debouncer,
  swallowDebounceCancel,
} from "../../../../../types/debounce";
import { MaskShape } from "../../../components/shapes/Mask";
import {
  operationBeginWithAsync,
  operationCancel,
} from "../../../slice/operation";
import {
  GestureEvent,
  GestureIdentifier,
  GestureOverload,
} from "../../../types/events";
import { Begin } from "../../../types/operation";
import { ShapeType } from "../../../types/shapes";
import { ToolGesturePayload, ToolThunk } from "../../../types/thunks";
import { Tool, ToolStatus } from "../../../types/toolbox";
import {
  createActivateThunk,
  createConfigureThunk,
  createLabelThunk,
  createToolThunk,
} from "../../custom-tool";
import { cvCreateLoaderThunk } from "../cv-tool";

// debounce preview operation
const debouncer = new Debouncer(150);

interface OperationPayload {
  gesture: GestureEvent;
  data: CvSamOnnxToolData;
}

const previewOperation: Begin<CvSamOnnxToolOperation> = {
  type: "tool/cv",
  silence: true,
  state: {
    tool: Tool.Cv,
  },
};

const runOperation: Begin<CvSamOnnxToolOperation> = {
  type: "tool/cv",
  state: {
    tool: Tool.Cv,
    labeling: true,
  },
};

// convert the ONNX model output to a mask
function tensorToMaskShape(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  width: number,
  height: number
): MaskShape {
  const mask: number[][] = [];

  for (let y = 0; y < height; y++) {
    mask[y] = [];
    for (let x = 0; x < width; x++) mask[y][x] = data[y * width + x];
  }

  return {
    type: ShapeType.Mask,
    mask,
    width,
    height,
    dx: 0,
    dy: 0,
    preview: true,
  };
}

const prepare = cvCreateLoaderThunk<CvSamOnnxToolState>(
  { name: "Waiting for backend..." },
  async (
    { state, config, image },
    thunkApi,
    { progress, dispatchToolState }
  ) => {
    console.log("Preparing sam-onnx...");
    // clear the previous state
    dispatchToolState({
      status: ToolStatus.Loading,
      config,
      data: undefined,
    });

    if (!state.backend || state.algorithm?.frontend !== "sam-onnx")
      throw new Error("Tool is not configured properly");

    // TODO: provide configuration and update on return
    await cvPrepare(state.backend.url, state.algorithm, { url: image });
    const baseUrl = `${state.backend.url}/${state.algorithm}`;

    progress("Loading model...");
    const model = await InferenceSession.create(`${baseUrl}/onnx-quantized`);

    progress("Loading embeddings...");
    const np = new npyjs();
    const embeddings = await np.load(`${baseUrl}/embeddings`);
    const tensor = new ort.Tensor("float32", embeddings.data, embeddings.shape);

    progress("Loading model scale...");
    const dimensions = await samDimensionsFromUrl(image);

    // initialization successful
    dispatchToolState({
      status: ToolStatus.Ready,
      data: { tensor, model, dimensions },
    });
  }
);

export const activate = createActivateThunk<CvSamOnnxToolState>(
  { tool: Tool.Cv },
  (state, thunkApi) => prepare({ state, config: state.config }, thunkApi)
);

export const configure = createConfigureThunk<
  CvSamOnnxToolState,
  CvSamOnnxToolConfig
>({ tool: Tool.Cv }, (state, config, thunkApi) =>
  prepare({ state, config }, thunkApi)
);

const preview: ToolThunk<OperationPayload> = (
  { gesture, data: { model, tensor, dimensions } },
  { dispatch }
) => {
  // TODO: input from operation state
  const clicks = [{ ...gesture.transformed, clickType: 1 }];

  operationBeginWithAsync({ dispatch }, previewOperation, async ({ update }) =>
    debouncer
      .debounce(async () => {
        const feeds = samOnnxFeeds({
          clicks,
          tensor,
          dimensions,
        });

        const results = await model.run(feeds);
        // TODO: allow selecting other outputs
        const output = results[model.outputNames[0]];
        const shape = tensorToMaskShape(
          output.data,
          output.dims[3],
          output.dims[2]
        );

        await update({
          type: "tool/cv",
          state: {
            tool: Tool.Cv,
            shape,
          },
        });
      })
      .catch(swallowDebounceCancel)
  );
};

const run: ToolThunk<OperationPayload> = (
  { gesture, data: { model, tensor, dimensions } },
  { dispatch },
  { requestLabel, cancelLabel }
) => {
  // TODO: input from operation state
  const clicks = [{ ...gesture.transformed, clickType: 1 }];

  operationBeginWithAsync({ dispatch }, runOperation, async ({ update }) => {
    debouncer.cancel();
    const feeds = samOnnxFeeds({
      clicks,
      tensor,
      dimensions,
    });

    const results = await model.run(feeds);
    // TODO: allow selecting other outputs
    const output = results[model.outputNames[0]];
    const shape = tensorToMaskShape(
      output.data,
      output.dims[3],
      output.dims[2]
    );

    await update({
      type: "tool/cv",
      state: {
        tool: Tool.Cv,
        shape,
        labeling: true,
      },
      // register cleanup
      cancellation: cancelLabel,
      completion: cancelLabel,
    });

    // request a label for the shape
    requestLabel();
  });
};

export const gesture = createToolThunk<
  ToolGesturePayload,
  CvSamOnnxToolOperation
>({ operation: "tool/cv" }, ({ gesture }, operation, thunkApi, toolApi) => {
  const state = thunkApi.getToolState<CvSamOnnxToolState | undefined>();
  const ready = state?.status === ToolStatus.Ready;
  const data = state?.data;
  // tool is not configured properly
  if (!ready || !data) return;

  if (gesture.identifier === GestureIdentifier.Move) {
    if (!operation?.state.labeling)
      // display preview when cursor pauses
      preview({ gesture, data }, thunkApi, toolApi);
  }

  if (gesture.identifier === GestureIdentifier.Click) {
    if (operation?.state.labeling)
      // labeling process is can be canceled by clicking
      return thunkApi.dispatch(operationCancel(operation));
    if (gesture.overload === GestureOverload.Primary)
      // extract segmentation mask
      run({ gesture, data }, thunkApi, toolApi);
  }
});

export const label = createLabelThunk<CvSamOnnxToolOperation>({
  operation: "tool/cv",
  select: (operation) => ({
    ...(operation.state.shape as MaskShape),
    // disable preview mode
    preview: false,
  }),
});
