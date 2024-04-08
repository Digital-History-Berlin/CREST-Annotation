import { RectangleToolOperation } from "./types";
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

const activate = createActivate({ tool: Tool.Rectangle });

const start: AtomicDragToolStartThunk<RectangleToolOperation> = ({
  transformed: { x, y },
}) => ({
  tool: Tool.Rectangle,
  shape: {
    type: ShapeType.Rectangle,
    x: x,
    y: y,
    width: 0,
    height: 0,
  },
});

const move: AtomicDragToolMoveThunk<RectangleToolOperation> = (
  { transformed: { x, y } },
  state
) => ({
  ...state,
  // change existing shape
  shape: {
    ...state.shape,
    width: x - state.shape.x,
    height: y - state.shape.y,
  },
});

const end: AtomicDragToolEndThunk<RectangleToolOperation> = (
  gesture,
  state
) => {
  return { ...state, labeling: true };
};

export const gesture = createAtomicDragTool({
  operation: "tool/rectangle",
  start,
  move,
  end,
});

export const label = createLabel({ operation: "tool/rectangle" });

export const rectangleThunks: ToolThunks = {
  activate,
  gesture,
  label,
};
