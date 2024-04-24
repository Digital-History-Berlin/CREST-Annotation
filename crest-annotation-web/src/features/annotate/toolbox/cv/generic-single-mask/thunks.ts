import { cvPrepare, cvPreview, cvRun } from "../../../../../api/cvApi";
import { swallowDebounceCancel } from "../../../../../types/debounce";
import { MaskShape } from "../../../components/shapes/Mask";
import { operationCancel } from "../../../slice/operation";
import { patchToolState } from "../../../slice/toolbox";
import {
  GestureEvent,
  GestureIdentifier,
  GestureOverload,
} from "../../../types/events";
import { Begin } from "../../../types/operation";
import { ShapeType } from "../../../types/shapes";
import {
  ToolGesturePayload,
  ToolThunk,
  ToolboxThunkApi,
} from "../../../types/thunks";
import { Tool, ToolStatus } from "../../../types/toolbox";
import { withAsyncToolOperation } from "../../async-tool";
import {
  createActivateThunk,
  createConfigureThunk,
  createLabelThunk,
  createToolThunk,
} from "../../custom-tool";
import {
  CvBackendConfig,
  CvToolConfig,
  CvToolInfo,
  CvToolOperation,
} from "../types";

interface OperationPayload {
  gesture: GestureEvent;
  backend: CvBackendConfig;
  algorithm: string;
}

const previewOperation: Begin<CvToolOperation> = {
  type: "tool/cv",
  silence: true,
  state: { tool: Tool.Cv },
};

const runOperation: Begin<CvToolOperation> = {
  type: "tool/cv",
  state: { tool: Tool.Cv, labeling: true },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toMaskShape = (json: { mask: number[][] }): MaskShape => ({
  type: ShapeType.Mask,
  mask: json.mask,
  width: json.mask[0].length,
  height: json.mask.length,
  dx: 0,
  dy: 0,
  preview: true,
});

const prepare = (info: CvToolInfo, { dispatch, getState }: ToolboxThunkApi) => {
  console.log("Preparing generic-single-mask...");

  const {
    annotations: { project, object, image },
  } = getState();

  if (!project || !object || !image || !info.backend || !info.algorithm) {
    console.log("Tool is not configured properly");
    // initialization not possible
    return dispatch(
      patchToolState({
        tool: Tool.Cv,
        patch: { status: ToolStatus.Failed },
      })
    );
  }

  // begin initializing the tool
  dispatch(
    patchToolState({
      tool: Tool.Cv,
      patch: { status: ToolStatus.Loading },
    })
  );

  const body = { url: image };
  cvPrepare(info.backend.url, info.algorithm, body)
    .then(async () => {
      dispatch(
        patchToolState({
          tool: Tool.Cv,
          patch: { status: ToolStatus.Ready },
        })
      );
    })
    .catch((error) => {
      console.log("Tool initialization failed", error);
      dispatch(
        patchToolState({
          tool: Tool.Cv,
          patch: { status: ToolStatus.Ready },
        })
      );
    });
};

export const activate = createActivateThunk<CvToolInfo>(
  { tool: Tool.Cv },
  (info, thunkApi) => prepare(info, thunkApi)
);

export const configure = createConfigureThunk<CvToolInfo, CvToolConfig>(
  { tool: Tool.Cv },
  (info, config, thunkApi) => prepare(info, thunkApi)
);

const preview: ToolThunk<OperationPayload> = (
  { gesture, backend, algorithm },
  { dispatch }
) => {
  const body = { cursor: gesture.transformed };
  withAsyncToolOperation(
    { initial: previewOperation, dispatch },
    ({ update }) =>
      cvPreview(backend.url, algorithm, body)
        .then((response) => response.json())
        .then(toMaskShape)
        .then((shape) =>
          update({
            type: "tool/cv",
            state: { tool: Tool.Cv, shape },
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
  withAsyncToolOperation({ initial: runOperation, dispatch }, ({ update }) =>
    cvRun(backend.url, algorithm, body)
      .then((response) => response.json())
      .then(toMaskShape)
      .then((shape) => {
        update({
          type: "tool/cv",
          state: { tool: Tool.Cv, shape, labeling: true },
          // register cleanup
          cancellation: cancelLabel,
          finalization: cancelLabel,
        });

        // request a label for the shape
        requestLabel();
      })
  );
};

export const gesture = createToolThunk<ToolGesturePayload, CvToolOperation>(
  { operation: "tool/cv" },
  ({ gesture }, operation, thunkApi, toolApi) => {
    const info = thunkApi.getInfo<CvToolInfo | undefined>();
    const backend = info?.backend;
    const algorithm = info?.algorithm;
    // tool is not configured properly
    if (!backend || !algorithm) return;

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
  }
);

export const label = createLabelThunk({
  operation: "tool/cv",
  select: (operation) => ({
    ...(operation.state.shape as MaskShape),
    // disable preview mode
    preview: false,
  }),
});
