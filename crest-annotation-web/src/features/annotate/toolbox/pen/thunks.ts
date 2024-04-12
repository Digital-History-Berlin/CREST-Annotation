import { PenToolOperation } from "./types";
import { ShapeType } from "../../types/shapes";
import { ToolThunks } from "../../types/thunks";
import { Tool, ToolGroup } from "../../types/toolbox";
import {
  AtomicDragToolEndThunk,
  AtomicDragToolMoveThunk,
  AtomicDragToolStartThunk,
  createAtomicDragTool,
} from "../atomic-drag-tool";
import {
  createActivateThunk,
  createLabelThunk,
  createToolSelectors,
} from "../custom-tool";

const activate = createActivateThunk({ tool: Tool.Pen });

const start: AtomicDragToolStartThunk<PenToolOperation> = ({
  transformed: { x, y },
}) => ({
  tool: Tool.Pen,
  shape: {
    type: ShapeType.Line,
    points: [x, y],
    closed: false,
  },
});

const move: AtomicDragToolMoveThunk<PenToolOperation> = (
  { transformed: { x, y } },
  state
) => ({
  ...state,
  // change existing shape
  shape: {
    ...state.shape,
    points: [...state.shape.points, x, y],
  },
});

const end: AtomicDragToolEndThunk<PenToolOperation> = (gesture, state) => {
  return {
    ...state,
    shape: {
      ...state.shape,
      closed: true,
    },
    labeling: true,
  };
};

export const gesture = createAtomicDragTool({
  operation: "tool/pen",
  start,
  move,
  end,
});

export const label = createLabelThunk({ operation: "tool/pen" });

export const penThunks: ToolThunks = {
  activate,
  gesture,
  label,
};

export const penSelectors = createToolSelectors({
  tool: Tool.Pen,
  group: ToolGroup.Shape,
  icon: {
    name: "majesticons:edit-pen-4-line",
    style: { fontSize: "22px" },
    tooltip: "Pen",
  },
});
