import { v4 as uuidv4 } from "uuid";
import {
  DebounceCancelError,
  cvPreview,
  cvRun,
} from "../../../../../api/cvApi";
import { MaskShape } from "../../../components/shapes/Mask";
import { addAnnotation } from "../../../slice/annotations";
import {
  isOperationOfType,
  operationBegin,
  operationCancel,
  operationComplete,
  operationUpdate,
} from "../../../slice/operation";
import {
  GestureEvent,
  GestureIdentifier,
  GestureOverload,
} from "../../../types/events";
import { ShapeType } from "../../../types/shapes";
import {
  ToolGesturePayload,
  ToolLabelPayload,
  ToolThunk,
} from "../../../types/thunks";
import { Tool } from "../../../types/toolbox";
import { createToolThunk } from "../../custom-tool";
import { CvToolConfig, CvToolInfo, CvToolOperation } from "../types";

interface OperationPayload {
  gesture: GestureEvent;
  config: CvToolConfig;
}

const previewOperation: Omit<CvToolOperation, "id"> = {
  type: "tool/cv",
  silence: true,
  state: {
    tool: Tool.Cv,
    interface: "generic-single-mask",
    shape: undefined,
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toPreviewMask = (json: any) => ({
  type: ShapeType.Mask,
  mask: json.mask,
  width: json.mask[0].length,
  height: json.mask.length,
  dx: 0,
  dy: 0,
  preview: true,
});

const preview: ToolThunk<OperationPayload> = (
  { gesture, config },
  { dispatch }
) => {
  // TODO: dispatchAsync() wrapper
  dispatch(operationBegin(previewOperation))
    .unwrap()
    .then((operation) => {
      const body = { cursor: gesture.transformed };
      cvPreview(config.backend, config.algorithm, body)
        .then((response) => response.json())
        .then(toPreviewMask)
        .then((mask) =>
          dispatch(
            operationUpdate({
              id: operation.id,
              type: "tool/cv",
              state: {
                tool: Tool.Cv,
                interface: "generic-single-mask",
                shape: mask,
              },
            })
          )
        )
        .catch((error) => {
          if (!(error instanceof DebounceCancelError)) console.log(error);
          // cancel operation on error
          dispatch(operationCancel(operation));
        });
    });
};

const run: ToolThunk<OperationPayload> = (
  { gesture, config },
  { dispatch },
  { requestLabel, cancelLabel }
) => {
  const body = { cursor: gesture.transformed };
  cvRun(config.backend, config.algorithm, body)
    .then((response) => response.json())
    .then(toPreviewMask)
    .then((mask) => {
      dispatch(
        operationBegin({
          type: "tool/cv",
          state: {
            tool: Tool.Cv,
            interface: "generic-single-mask",
            shape: mask,
            labeling: true,
          },
          // register cleanup
          cancellation: cancelLabel,
          finalization: cancelLabel,
        })
      );

      // request a label for the shape
      requestLabel();
    });
};

export const gesture = createToolThunk<ToolGesturePayload, CvToolOperation>(
  { operation: "tool/cv" },
  ({ gesture }, operation, thunkApi, toolApi) => {
    const info = thunkApi.getInfo<CvToolInfo | undefined>();
    const config = info?.config;
    if (!config) return;

    if (gesture.identifier === GestureIdentifier.Move) {
      if (!operation?.state.labeling)
        // display preview when cursor pauses
        preview({ gesture, config }, thunkApi, toolApi);
    }

    if (gesture.identifier === GestureIdentifier.Click) {
      if (operation?.state.labeling)
        // labeling process is can be canceled by clicking
        return thunkApi.dispatch(operationCancel(operation));
      if (gesture.overload === GestureOverload.Primary)
        // extract segmentation mask
        run({ gesture, config }, thunkApi, toolApi);
    }
  }
);

export const label: ToolThunk<ToolLabelPayload> = (
  { label },
  { dispatch, getState }
) => {
  if (label === undefined)
    // cancel operation if labeling was canceled
    return dispatch(operationCancel());

  const {
    operation: { current },
  } = getState();

  if (
    !isOperationOfType<CvToolOperation>(current, "tool/cv") ||
    current.state.interface !== "generic-single-mask"
  )
    // no shape to label
    return;

  const shape = {
    ...(current.state.shape as MaskShape),
    // disable preview mode
    preview: false,
  };

  dispatch(operationComplete(current));
  // create a new annotation with shape
  dispatch(
    addAnnotation({
      id: uuidv4(),
      shapes: [shape],
      label,
    })
  );
};
