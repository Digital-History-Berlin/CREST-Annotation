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
import { CvToolConfig, CvToolInfo } from "./types";
import { cvPrepare } from "../../../../api/cvApi";
import { updateToolState } from "../../slice/toolbox";
import {
  ToolGesturePayload,
  ToolLabelPayload,
  ToolSelectors,
  ToolThunk,
  ToolThunks,
  ToolboxThunkApi,
} from "../../types/thunks";
import { Tool, ToolGroup, ToolStatus } from "../../types/toolbox";
import { createActivateThunk, createConfigureThunk } from "../custom-tool";

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
  const body = { url: image };
  cvPrepare(config.backend, config.algorithm, body)
    .then(async () => {
      // TODO: select the correct interface here
      const interfaceName = "generic-single-mask";
      const { gesture, label } = await import(`./${interfaceName}/thunks`);
      const { Preview } = await import(`./${interfaceName}/Preview`);
      console.log("Tool initialized successfully");
      dispatch(
        updateToolState({
          tool: Tool.Cv,
          // ensure the config is preserved
          state: {
            status: ToolStatus.Ready,
            config,
            interface: interfaceName,
            preview: Preview,
            gesture,
            label,
          },
        })
      );
    })
    .catch((error) => {
      console.log("Tool initialization failed", error);
      dispatchStatus(ToolStatus.Failed);
    });
};

const activate = createActivateThunk({ tool: Tool.Cv }, initialize);

const configure = createConfigureThunk(initialize);

const gesture: ToolThunk<ToolGesturePayload> = (payload, thunkApi, toolApi) => {
  const info = thunkApi.getInfo<CvToolInfo | undefined>();
  // forward to tool interface
  info?.gesture?.(payload, thunkApi, toolApi);
};

const label: ToolThunk<ToolLabelPayload> = (payload, thunkApi, toolApi) => {
  const info = thunkApi.getInfo<CvToolInfo | undefined>();
  // forward to tool interface
  info?.label?.(payload, thunkApi, toolApi);
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
