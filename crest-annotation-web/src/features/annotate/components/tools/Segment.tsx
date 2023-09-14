import { Mask } from "./Mask";
import { ShapeEventHandler, ShapeTool, ShapeToolEvent } from "./Types";
import { prepare, preview, run } from "../../../../api/cvApi";
import { RootState } from "../../../../app/store";
import { SegmentConfig, Tool } from "../../slice/tools";

const onBegin = async (
  { image }: ShapeToolEvent,
  { getState }: { getState: () => RootState }
) => {
  const config = getState().tools.toolConfigs[Tool.Segment];

  if (!config.backend || !config.algorithm) {
    console.log("Missing configuration", config);
    throw new Error("Missing configuration");
  }

  // forward configuration to backend
  await prepare(config.backend, config.algorithm, { url: image });
  console.log("Backend prepared");

  // update active tool configuration
  return config;
};

const onGestureMove: ShapeEventHandler = (
  shape,
  { transformed },
  callback,
  config
) => {
  const segment = config as SegmentConfig;

  console.log(segment);

  if (segment?.backend && segment?.algorithm)
    preview(
      segment.backend,
      segment.algorithm,
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
  const segment = config as SegmentConfig;

  if (segment?.backend && segment?.algorithm)
    run(segment.backend, segment.algorithm, { cursor: transformed })
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
