import { CvGenericSingleMaskToolOperation } from "./types";
import { cvPrepare, cvPreview, cvRun } from "../../../../../api/cvApi";
import { swallowDebounceCancel } from "../../../../../types/debounce";
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
import { CvAlgorithm, CvBackendConfig, CvToolState } from "../types";

interface OperationPayload {
  gesture: GestureEvent;
  backend: CvBackendConfig;
  algorithm: CvAlgorithm;
}

const previewOperation: Begin<CvGenericSingleMaskToolOperation> = {
  type: "tool/cv",
  silence: true,
  state: {
    tool: Tool.Cv,
  },
};

const runOperation: Begin<CvGenericSingleMaskToolOperation> = {
  type: "tool/cv",
  state: {
    tool: Tool.Cv,
    labeling: true,
  },
};

const toMaskShape = (json: { mask: number[][] }): MaskShape => ({
  type: ShapeType.Mask,
  mask: json.mask,
  width: json.mask[0].length,
  height: json.mask.length,
  dx: 0,
  dy: 0,
  preview: true,
});

const prepare = cvCreateLoaderThunk<CvToolState>(
  { name: "Waiting for backend..." },
  async ({ state, config, image }, thunkApi, { dispatchToolState }) => {
    console.log("Preparing generic-single-mask...");
    // clear the previous state
    dispatchToolState({
      status: ToolStatus.Loading,
      config,
      data: undefined,
    });

    if (!state.backend || state.algorithm?.frontend !== "generic-single-mask")
      throw new Error("Tool is not configured properly");

    // TODO: provide configuration and update on return
    await cvPrepare(state.backend.url, state.algorithm, { url: image });
    // initialization successful
    dispatchToolState({ status: ToolStatus.Ready, config });
  }
);

export const activate = createActivateThunk<CvToolState>(
  { tool: Tool.Cv },
  (state, thunkApi) => prepare({ state, config: state.config }, thunkApi)
);

export const configure = createConfigureThunk<CvToolState>(
  { tool: Tool.Cv },
  (state, config, thunkApi) => prepare({ state, config }, thunkApi)
);

const preview: ToolThunk<OperationPayload> = (
  { gesture, backend, algorithm },
  { dispatch }
) => {
  const body = { cursor: gesture.transformed };
  operationBeginWithAsync({ dispatch }, previewOperation, ({ update }) =>
    cvPreview(backend.url, algorithm, body)
      .then((response) => response.json())
      .then(toMaskShape)
      .then((shape) =>
        update({
          type: "tool/cv",
          state: {
            tool: Tool.Cv,
            shape,
          },
        })
      )
      .catch(swallowDebounceCancel)
  );
};

const run: ToolThunk<OperationPayload> = (
  { gesture, backend, algorithm },
  { dispatch },
  { requestLabel, cancelLabel }
) => {
  const body = { cursor: gesture.transformed };
  operationBeginWithAsync({ dispatch }, runOperation, ({ update }) =>
    cvRun(backend.url, algorithm, body)
      .then((response) => response.json())
      .then(toMaskShape)
      .then((shape) =>
        update({
          type: "tool/cv",
          state: {
            tool: Tool.Cv,
            shape,
            labeling: true,
          },
          // register cleanup
          cancellation: cancelLabel,
          completion: cancelLabel,
        })
      )
      // request a label for the shape
      .then(() => requestLabel())
  );
};

export const gesture = createToolThunk<
  ToolGesturePayload,
  CvGenericSingleMaskToolOperation
>({ operation: "tool/cv" }, ({ gesture }, operation, thunkApi, toolApi) => {
  const state = thunkApi.getToolState<CvToolState | undefined>();
  const ready = state?.status === ToolStatus.Ready;
  const backend = state?.backend;
  const algorithm = state?.algorithm;
  // tool is not configured properly
  if (!ready || !backend || !algorithm) return;

  if (gesture.identifier === GestureIdentifier.Move) {
    if (!operation?.state.labeling)
      // display preview when cursor pauses
      preview({ gesture, backend, algorithm }, thunkApi, toolApi);
  }

  if (gesture.identifier === GestureIdentifier.Click) {
    if (operation?.state.labeling)
      // labeling process is can be canceled by clicking
      return thunkApi.dispatch(operationCancel(operation));
    if (gesture.overload === GestureOverload.Primary)
      // extract segmentation mask
      run({ gesture, backend, algorithm }, thunkApi, toolApi);
  }
});

export const label = createLabelThunk<CvGenericSingleMaskToolOperation>({
  operation: "tool/cv",
  select: (operation) => ({
    ...(operation.state.shape as MaskShape),
    // disable preview mode
    preview: false,
  }),
});
