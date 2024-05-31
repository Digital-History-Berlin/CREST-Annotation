import npyjs from "npyjs";
import { InferenceSession } from "onnxruntime-web";
import * as ort from "onnxruntime-web";
import { samDimensionsFromUrl, samOnnxFeeds } from "./tools";
import {
  CvSamOnnxToolConfig,
  CvSamOnnxToolData,
  CvSamOnnxToolOperation,
  CvSamOnnxToolState,
  operationState,
  toolState,
} from "./types";
import { cvPrepare } from "../../../../../api/cvApi";
import {
  Debouncer,
  swallowDebounceCancel,
} from "../../../../../types/debounce";
import { MaskShape } from "../../../components/shapes/Mask";
import { operationCancel } from "../../../slice/operation";
import {
  GestureEvent,
  GestureIdentifier,
  GestureOverload,
} from "../../../types/events";
import { ShapeType } from "../../../types/shapes";
import { Tool, ToolStateError, ToolStatus } from "../../../types/toolbox";
import { ToolGesturePayload, ToolThunk } from "../../../types/toolbox-thunks";
import {
  createActivateThunk,
  createConfigureThunk,
  createLabelThunk,
  withBeginOperationContext,
} from "../../create-custom-tool";
import { cvCreateLoaderThunk } from "../create-cv-tool";

// debounce preview operation
const debouncer = new Debouncer(150);

interface OperationPayload {
  gesture: GestureEvent;
  data: CvSamOnnxToolData;
}

const previewOperation: CvSamOnnxToolOperation = {
  type: "tool/cv/sam-onnx",
  silence: true,
  state: {
    tool: Tool.Cv,
  },
};

const runOperation: CvSamOnnxToolOperation = {
  type: "tool/cv/sam-onnx",
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
  async ({ config, image }, { dispatchToolState }, contextApi, thunkApi) => {
    const { backend, algorithm } = toolState(thunkApi.getState(), false);

    console.log("Preparing sam-onnx...");
    // clear the previous state
    dispatchToolState({
      status: ToolStatus.Loading,
      config,
      data: undefined,
    });

    // TODO: provide configuration and update on return
    await cvPrepare(backend.url, algorithm, { url: image });
    const baseUrl = `${backend.url}/${algorithm.id}`;

    contextApi.progress("Loading model...");
    const model = await InferenceSession.create(`${baseUrl}/onnx-quantized`);

    contextApi.progress("Loading embeddings...");
    const np = new npyjs();
    const embeddings = await np.load(`${baseUrl}/embeddings`);
    const tensor = new ort.Tensor("float32", embeddings.data, embeddings.shape);

    contextApi.progress("Loading model scale...");
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
  (state, thunkApi) => prepare({ state, config: state?.config }, thunkApi)
);

export const configure = createConfigureThunk<
  CvSamOnnxToolState,
  CvSamOnnxToolConfig
>({ tool: Tool.Cv }, (state, config, thunkApi) =>
  prepare({ state, config }, thunkApi)
);

const preview: ToolThunk<OperationPayload> = (
  { gesture, data: { model, tensor, dimensions } },
  thunkApi
) => {
  // TODO: input from operation state
  const clicks = [{ ...gesture.transformed, clickType: 1 }];

  withBeginOperationContext(
    previewOperation,
    { thunkApi },
    async ({ update }) =>
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
            type: "tool/cv/sam-onnx",
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
  thunkApi,
  { requestLabel, cancelLabel }
) => {
  // TODO: input from operation state
  const clicks = [{ ...gesture.transformed, clickType: 1 }];

  withBeginOperationContext(runOperation, { thunkApi }, async ({ update }) => {
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
      type: "tool/cv/sam-onnx",
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

export const gesture: ToolThunk<ToolGesturePayload> = (
  { gesture },
  thunkApi,
  toolApi
) => {
  const state = thunkApi.getState();
  const { data } = toolState(state);
  const current = operationState(state);

  if (data === undefined)
    throw new ToolStateError(Tool.Cv, "SAM-ONNX model not available");

  if (gesture.identifier === GestureIdentifier.Move) {
    if (!current?.labeling)
      // display preview when cursor pauses
      preview({ gesture, data }, thunkApi, toolApi);
  }

  if (gesture.identifier === GestureIdentifier.Click) {
    if (current?.labeling)
      // labeling process can be canceled by clicking
      return thunkApi
        .dispatch(operationCancel({ id: state.operation.id }))
        .unwrap();
    if (gesture.overload === GestureOverload.Primary)
      // extract segmentation mask
      run({ gesture, data }, thunkApi, toolApi);
  }
};

export const label = createLabelThunk<CvSamOnnxToolOperation>({
  operation: "tool/cv/sam-onnx",
  select: (operation) => [
    // disable preview mode
    { ...(operation.state.shape as MaskShape), preview: false },
  ],
});
