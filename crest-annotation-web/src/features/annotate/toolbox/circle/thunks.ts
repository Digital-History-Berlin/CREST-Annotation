import { CircleToolOperation } from "./types";
import { ShapeType } from "../../types/shapes";
import { Tool, ToolGroup } from "../../types/toolbox";
import { ToolThunks } from "../../types/toolbox-thunks";
import {
  AtomicDragToolEndThunk,
  AtomicDragToolMoveThunk,
  AtomicDragToolStartThunk,
  createAtomicDragTool,
} from "../create-atomic-drag-tool";
import {
  createActivateThunk,
  createLabelShapeThunk,
  createToolSelectors,
} from "../create-custom-tool";

const activate = createActivateThunk({ tool: Tool.Circle });

const start: AtomicDragToolStartThunk<CircleToolOperation> = ({
  transformed: { x, y },
}) => ({
  tool: Tool.Circle,
  shape: {
    type: ShapeType.Circle,
    x: x,
    y: y,
    radius: 0,
  },
});

const move: AtomicDragToolMoveThunk<CircleToolOperation> = (
  { transformed: { x, y } },
  state
) => ({
  ...state,
  // change existing shape
  shape: {
    ...state.shape,
    radius: Math.sqrt(
      Math.pow(x - state.shape.x, 2) + Math.pow(y - state.shape.y, 2)
    ),
  },
});

const end: AtomicDragToolEndThunk<CircleToolOperation> = (gesture, state) => {
  return { ...state, labeling: true };
};

export const gesture = createAtomicDragTool({
  operation: "tool/circle",
  start,
  move,
  end,
});

export const label = createLabelShapeThunk({ operation: "tool/circle" });

export const circleThunks: ToolThunks = {
  activate,
  gesture,
  label,
};

export const circleSelectors = createToolSelectors({
  tool: Tool.Circle,
  group: ToolGroup.Shape,
  icon: {
    name: "mdi:vector-circle-variant",
    style: { fontSize: "25px" },
    tooltip: "Circle",
  },
});
