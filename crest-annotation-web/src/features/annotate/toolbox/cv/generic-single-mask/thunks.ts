import {
  CvGenericSingleMaskToolOperation,
  operationState,
  toolState,
} from "./types";
import { cvPrepare, cvPreview, cvRun } from "../../../../../api/cvApi";
import { swallowDebounceCancel } from "../../../../../types/debounce";
import { MaskShape } from "../../../components/shapes/Mask";
import { operationCancel } from "../../../slice/operation";
import {
  GestureEvent,
  GestureIdentifier,
  GestureOverload,
} from "../../../types/events";
import { ShapeType } from "../../../types/shapes";
import { Tool, ToolStatus } from "../../../types/toolbox";
import { ToolGesturePayload, ToolThunk } from "../../../types/toolbox-thunks";
import {
  createActivateThunk,
  createConfigureThunk,
  createLabelThunk,
  withBeginOperationContext,
} from "../../create-custom-tool";
import { cvCreateLoaderThunk } from "../create-cv-tool";
import { CvAlgorithm, CvBackendConfig, CvToolState } from "../types";

interface OperationPayload {
  gesture: GestureEvent;
  backend: CvBackendConfig;
  algorithm: CvAlgorithm;
}

const previewOperation: CvGenericSingleMaskToolOperation = {
  type: "tool/cv/generic-single-mask",
  silence: true,
  state: {
    tool: Tool.Cv,
  },
};

const runOperation: CvGenericSingleMaskToolOperation = {
  type: "tool/cv/generic-single-mask",
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
  async ({ config, image }, { dispatchToolState }, contextApi, thunkApi) => {
    const { backend, algorithm } = toolState(thunkApi.getState(), false);

    console.log("Preparing generic-single-mask...");
    // clear the previous state
    dispatchToolState({
      status: ToolStatus.Loading,
      config,
      data: undefined,
    });

    // TODO: provide configuration and update on return
    await cvPrepare(backend.url, algorithm, { url: image });
    // initialization successful
    dispatchToolState({ status: ToolStatus.Ready, config });
  }
);

export const activate = createActivateThunk<CvToolState>(
  { tool: Tool.Cv },
  (state, thunkApi) => prepare({ state, config: state?.config }, thunkApi)
);

export const configure = createConfigureThunk<CvToolState>(
  { tool: Tool.Cv },
  (state, config, thunkApi) => prepare({ state, config }, thunkApi)
);

const preview: ToolThunk<OperationPayload> = (
  { gesture, backend, algorithm },
  thunkApi
) => {
  const body = { cursor: gesture.transformed };
  withBeginOperationContext(previewOperation, { thunkApi }, ({ update }) =>
    cvPreview(backend.url, algorithm, body)
      .then((response) => response.json())
      .then(toMaskShape)
      .then((shape) =>
        update({
          type: "tool/cv/generic-single-mask",
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
  thunkApi,
  { requestLabel, cancelLabel }
) => {
  const body = { cursor: gesture.transformed };
  withBeginOperationContext(runOperation, { thunkApi }, ({ update }) =>
    cvRun(backend.url, algorithm, body)
      .then((response) => response.json())
      .then(toMaskShape)
      .then((shape) =>
        update({
          type: "tool/cv/generic-single-mask",
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

export const gesture: ToolThunk<ToolGesturePayload> = (
  { gesture },
  thunkApi,
  toolApi
) => {
  const state = thunkApi.getState();
  const { backend, algorithm } = toolState(state);
  const current = operationState(state);

  if (gesture.identifier === GestureIdentifier.Move) {
    if (!current?.labeling)
      // display preview when cursor pauses
      return preview({ gesture, backend, algorithm }, thunkApi, toolApi);
  }

  if (gesture.identifier === GestureIdentifier.Click) {
    if (current?.labeling)
      // labeling process can be canceled by clicking
      return thunkApi
        .dispatch(operationCancel({ id: state.operation.id }))
        .unwrap();
    if (gesture.overload === GestureOverload.Primary)
      // extract segmentation mask
      return run({ gesture, backend, algorithm }, thunkApi, toolApi);
  }
};

export const label = createLabelThunk<CvGenericSingleMaskToolOperation>({
  operation: "tool/cv/generic-single-mask",
  select: (operation) => [
    // disable preview mode
    { ...(operation.state.shape as MaskShape), preview: false },
  ],
});
