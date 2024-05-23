import { RectangleToolOperation } from "./types";
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

const activate = createActivateThunk({ tool: Tool.Rectangle });

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

export const label = createLabelShapeThunk({ operation: "tool/rectangle" });

export const rectangleThunks: ToolThunks = {
  activate,
  gesture,
  label,
};

export const rectangleSelectors = createToolSelectors({
  tool: Tool.Rectangle,
  group: ToolGroup.Shape,
  icon: {
    name: "mdi:vector-square",
    style: { fontSize: "25px" },
    tooltip: "Rectangle",
  },
});
