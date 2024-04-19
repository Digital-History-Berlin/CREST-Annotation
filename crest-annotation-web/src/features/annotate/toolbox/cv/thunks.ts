/*
import { Mask } from "./Mask";
import {
  ShapeEventHandler,
  ShapeGestureError,
  ShapeTool,
  ShapeToolEventHandler,
} from "./Types";
import { prepare, preview, run } from "../../../../api/cvApi";
import { SegmentConfig } from "../../slice/configs";
import { Tool } from "../../slice/tools";

const onGestureMove: ShapeEventHandler = async (
  shape,
  { transformed },
  config
) => {
  const valid = config as SegmentConfig;

  if (!valid?.backend || !valid?.algorithm)
    throw new ShapeGestureError("Invalid config");

  const body = { cursor: transformed };
  const response = await preview(valid.backend, valid.algorithm, body);
  const json = await response.json();

  return [
    "proceed",
    {
      mask: json.mask,
      width: json.mask[0].length,
      height: json.mask.length,
      dx: 0,
      dy: 0,
      tool: Tool.Segment,
      preview: true,
    },
  ];
};

const onGestureClick: ShapeEventHandler = async (
  shape,
  { transformed },
  config
) => {
  const valid = config as SegmentConfig;

  if (!valid?.backend || !valid?.algorithm)
    throw new ShapeGestureError("Invalid config");

  const body = { cursor: transformed };
  const response = await run(valid.backend, valid.algorithm, body);
  const json = await response.json();

  return [
    "resolve",
    {
      mask: json.mask,
      width: json.mask[0].length,
      height: json.mask.length,
      dx: 0,
      dy: 0,
      tool: Tool.Segment,
      preview: false,
    },
  ];
};

const SegmentTool: ShapeTool = {
  component: Mask,
  onBegin,
  onGestureMove,
  onGestureClick,
};

export default SegmentTool;
*/
import { v4 as uuidv4 } from "uuid";
import { CvToolConfig, CvToolInfo, CvToolOperation } from "./types";
import {
  DebounceCancelError,
  cvPrepare,
  cvPreview,
} from "../../../../api/cvApi";
import { MaskShape } from "../../components/shapes/Mask";
import { addAnnotation } from "../../slice/annotations";
import {
  isOperationOfType,
  operationBegin,
  operationCancel,
  operationComplete,
  operationUpdate,
} from "../../slice/operation";
import { updateToolState } from "../../slice/toolbox";
import { GestureIdentifier } from "../../types/events";
import { ShapeType } from "../../types/shapes";
import {
  ToolGesturePayload,
  ToolLabelPayload,
  ToolSelectors,
  ToolThunk,
  ToolThunks,
  ToolboxThunkApi,
} from "../../types/thunks";
import { Tool, ToolGroup, ToolStatus } from "../../types/toolbox";
import {
  createActivateThunk,
  createConfigureThunk,
  createToolThunk,
} from "../custom-tool";

const initialize = (
  config: CvToolConfig | undefined,
  { dispatch, getState }: ToolboxThunkApi
) => {
  const dispatchStatus = (status: ToolStatus) => {
    dispatch(
      updateToolState({
        tool: Tool.Cv,
        // ensure the config is preserved
        state: { status, config },
      })
    );
  };

  const {
    annotations: { project, object, image },
  } = getState();

  if (!project || !object || !image || !config) {
    console.log("Tool is not configured properly");
    // initialization not possible
    return dispatchStatus(ToolStatus.Failed);
  }

  // begin initializing the tool
  dispatchStatus(ToolStatus.Loading);
  cvPrepare(config.backend, config.algorithm, {
    url: image,
  })
    .then(() => {
      console.log("Tool initialized successfully");
      dispatchStatus(ToolStatus.Ready);
    })
    .catch((error) => {
      console.log("Tool initialization failed", error);
      dispatchStatus(ToolStatus.Failed);
    });
};

const activate = createActivateThunk({ tool: Tool.Cv }, initialize);

const configure = createConfigureThunk(initialize);

export const gesture = createToolThunk<ToolGesturePayload, CvToolOperation>(
  { operation: "tool/cv" },
  (
    { gesture },
    operation,
    { dispatch, getInfo },
    { requestLabel, cancelLabel }
  ) => {
    const info = getInfo<CvToolInfo | undefined>();
    const config = info?.config;
    if (!config) return;

    if (gesture.identifier === GestureIdentifier.Move) {
      if (operation?.state.labeling) return;

      dispatch(
        operationBegin({
          type: "tool/cv",
          state: { tool: Tool.Cv, shape: undefined },
          silence: true,
        })
      )
        .unwrap()
        .then(async (operation) => {
          try {
            const body = { cursor: gesture.transformed };
            const response = await cvPreview(
              config.backend,
              config.algorithm,
              body
            );
            const json = await response.json();

            dispatch(
              operationUpdate({
                id: operation.id,
                type: "tool/cv",
                state: {
                  tool: Tool.Cv,
                  shape: {
                    type: ShapeType.Mask,
                    mask: json.mask,
                    width: json.mask[0].length,
                    height: json.mask.length,
                    dx: 0,
                    dy: 0,
                    preview: true,
                  },
                },
              })
            );
          } catch (error) {
            if (!(error instanceof DebounceCancelError)) console.log(error);
            // cancel operation on error
            dispatch(operationCancel(operation));
          }
        });
    }

    if (gesture.identifier === GestureIdentifier.Click) {
      if (operation?.state.labeling)
        // labeling process is can be canceled by clicking
        return dispatch(operationCancel(operation));

      const body = { cursor: gesture.transformed };
      cvPreview(config.backend, config.algorithm, body)
        .then((response) => response.json())
        .then((json) => {
          dispatch(
            operationBegin({
              type: "tool/cv",
              state: {
                tool: Tool.Cv,
                shape: {
                  type: ShapeType.Mask,
                  mask: json.mask,
                  width: json.mask[0].length,
                  height: json.mask.length,
                  dx: 0,
                  dy: 0,
                  preview: true,
                },
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

  if (!isOperationOfType<CvToolOperation>(current, "tool/cv"))
    // no shape to label
    return;

  dispatch(operationComplete(current));
  // create a new annotation with shape
  dispatch(
    addAnnotation({
      id: uuidv4(),
      shapes: [
        {
          ...current.state.shape,
          preview: false,
        } as MaskShape,
      ],
      label,
    })
  );
};

export const cvThunks: ToolThunks = {
  activate,
  configure,
  gesture,
  label,
};

export const cvSelectors: ToolSelectors<CvToolInfo | undefined> = {
  info: (state) => ({
    status: state?.status ?? ToolStatus.Failed,
    group: ToolGroup.Cv,
    icon: {
      name: "mdi:auto-fix",
      style: { fontSize: "25px" },
      tooltip: "Computer Vision",
    },
  }),
};
