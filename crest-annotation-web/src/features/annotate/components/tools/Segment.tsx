import { Mask } from "./Mask";
import { ShapeEventHandler, ShapeTool, ShapeToolEventHandler } from "./Types";
import { prepare, preview, run } from "../../../../api/cvApi";
import { SegmentConfig, Tool } from "../../slice/tools";

const onBegin: ShapeToolEventHandler = async ({ image }, config) => {
  const valid = config as SegmentConfig;

  if (!valid.backend || !valid.algorithm)
    // tool can not be activated without configuration
    throw new Error("Missing configuration");

  // forward configuration to backend
  await prepare(valid.backend, valid.algorithm, { url: image });
};

const onGestureMove: ShapeEventHandler = (
  shape,
  { transformed },
  callback,
  config
) => {
  const valid = config as SegmentConfig;

  if (shape?.finished || !valid?.backend || !valid?.algorithm) return;

  preview(
    valid.backend,
    valid.algorithm,
    { cursor: transformed },
    (response) => {
      response
        .json()
        .then((data) =>
          callback({
            mask: data.mask,
            width: data.mask[0].length,
            height: data.mask.length,
            dx: 0,
            dy: 0,
            tool: Tool.Segment,
            finished: false,
          })
        )
        .catch(console.log);
    }
  );
};

const onGestureClick: ShapeEventHandler = (
  shape,
  { transformed },
  callback,
  config
) => {
  const valid = config as SegmentConfig;

  if (shape?.finished || !valid?.backend || !valid?.algorithm) return;

  run(valid.backend, valid.algorithm, { cursor: transformed })
    .then((response) => response.json())
    .then((mask) =>
      callback({
        mask: mask.mask,
        width: mask.mask[0].length,
        height: mask.mask.length,
        dx: 0,
        dy: 0,
        tool: Tool.Segment,
        finished: true,
      })
    )
    .catch(console.log);
};

const SegmentTool: ShapeTool = {
  component: Mask,
  onBegin,
  onGestureMove,
  onGestureClick,
};

export default SegmentTool;
