import { Mask } from "./Mask";
import { ShapeEventHandler, ShapeTool, ShapeToolEvent } from "./Types";
import { prepare, preview, run } from "../../../../api/cvApi";
import { Tool } from "../../slice/tools";

const onBegin = (event: ShapeToolEvent) => {
  prepare({ url: event.image }).catch(console.log);
};

const onGestureMove: ShapeEventHandler = (shape, event, callback) => {
  preview({ cursor: event.transformed }, (response) => {
    response
      .json()
      .then((data) => {
        console.log(data);
        callback({
          mask: data.mask,
          width: data.mask[0].length,
          height: data.mask.length,
          dx: 0,
          dy: 0,
          tool: Tool.Segment,
          finished: false,
        });
      })
      .catch(console.log);
  });
};

const onGestureClick: ShapeEventHandler = (shape, event, callback) => {
  run({ cursor: event.transformed })
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
