import { cvPrepare, cvPreview, cvRun } from "../../../../../api/cvApi";
import { swallowDebounceCancel } from "../../../../../types/debounce";
import { MaskShape } from "../../../components/shapes/Mask";
import { operationCancel, operationWithAsync } from "../../../slice/operation";
import {
  GestureEvent,
  GestureIdentifier,
  GestureOverload,
} from "../../../types/events";
import { Begin } from "../../../types/operation";
import { ShapeType } from "../../../types/shapes";
import { ToolGesturePayload, ToolThunk } from "../../../types/thunks";
import { Tool, ToolStatus } from "../../../types/toolbox";
import { createLoaderThunk } from "../../async-tool";
import {
  createActivateThunk,
  createConfigureThunk,
  createLabelThunk,
  createToolThunk,
} from "../../custom-tool";
import { CvBackendConfig, CvToolInfo, CvToolOperation } from "../types";

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

const toMaskShape = (json: { mask: number[][] }): MaskShape => ({
  type: ShapeType.Mask,
  mask: json.mask,
  width: json.mask[0].length,
  height: json.mask.length,
  dx: 0,
  dy: 0,
  preview: true,
});

const prepare = createLoaderThunk<CvToolInfo>(
  { tool: Tool.Cv, name: "Waiting for backend..." },
  async ({ info, config, image }, thunkApi, { configure }) => {
    console.log("Preparing generic-single-mask...");

    if (!info.backend || !info.algorithm)
      throw new Error("Tool is not configured properly");

    // TODO: provide configuration and update on return
    await cvPrepare(info.backend.url, info.algorithm, { url: image });
    // initialization successful
    configure({ status: ToolStatus.Ready, config });
  }
);

export const activate = createActivateThunk<CvToolInfo>(
  { tool: Tool.Cv },
  (info, thunkApi) => prepare({ info, config: info.config }, thunkApi)
);

export const configure = createConfigureThunk<CvToolInfo>(
  { tool: Tool.Cv },
  (info, config, thunkApi) => prepare({ info, config }, thunkApi)
);

const preview: ToolThunk<OperationPayload> = (
  { gesture, backend, algorithm },
  { dispatch }
) => {
  const body = { cursor: gesture.transformed };
  operationWithAsync({ dispatch }, previewOperation, ({ update }) =>
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
  operationWithAsync({ dispatch }, runOperation, ({ update }) =>
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
    const ready = info?.status === ToolStatus.Ready;
    const backend = info?.backend;
    const algorithm = info?.algorithm;
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
  }
);

export const label = createLabelThunk<CvToolOperation>({
  operation: "tool/cv",
  select: (operation) => ({
    ...(operation.state.shape as MaskShape),
    // disable preview mode
    preview: false,
  }),
});
