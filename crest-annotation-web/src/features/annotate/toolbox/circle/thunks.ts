import { CircleToolOperation } from "./types";
import { ShapeType } from "../../types/shapes";
import { ToolThunks } from "../../types/thunks";
import { Tool } from "../../types/toolbox";
import {
  AtomicDragToolEndThunk,
  AtomicDragToolMoveThunk,
  AtomicDragToolStartThunk,
  createAtomicDragTool,
} from "../atomic-drag-tool";
import { createActivate, createLabel } from "../custom-tool";

const activate = createActivate({ tool: Tool.Circle });

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

export const label = createLabel({ operation: "tool/circle" });

export const circleThunks: ToolThunks = {
  activate,
  gesture,
  label,
};
