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

const onBegin: ShapeToolEventHandler = async ({ image }, config) => {
  const valid = config as SegmentConfig;

  if (!valid.backend || !valid.algorithm)
    // tool can not be activated without configuration
    throw new Error("Missing configuration");

  // forward configuration to backend
  await prepare(valid.backend, valid.algorithm, { url: image });
};

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
