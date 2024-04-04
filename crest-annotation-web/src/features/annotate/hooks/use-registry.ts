import { FC } from "react";
import SegmentPane from "../components/configs/SegmentPane";
import {
  CirclePreview,
  CircleToolState,
} from "../components/previews/CirclePreview";
import { PenPreview, PenToolState } from "../components/previews/PenPreview";
import {
  PolygonPreview,
  PolygonToolState,
} from "../components/previews/PolygonPreview";
import { Circle } from "../components/shapes/Circle";
import { Line } from "../components/shapes/Line";
import { Mask } from "../components/shapes/Mask";
import { Polygon } from "../components/shapes/Polygon";
import { Rectangle } from "../components/shapes/Rectangle";
import { circleThunks } from "../tools/circle";
import { penThunks } from "../tools/pen";
import { polygonThunks } from "../tools/polygon";
import { Shape, ShapeFC, ShapeType } from "../types/shapes";
import { ToolThunks } from "../types/thunks";
import { PreviewFC, Tool } from "../types/tools";

/**
 * Shape component for each shape type
 *
 * This component renders shapes for existing annotations on the canvas.
 * It is different from the UI that is provided with the tools.
 */
const defaultShapeRegistry: Record<ShapeType, ShapeFC<Shape> | undefined> = {
  [ShapeType.Line]: Line as ShapeFC<Shape>,
  [ShapeType.Circle]: Circle as ShapeFC<Shape>,
  [ShapeType.Rectangle]: Rectangle as ShapeFC<Shape>,
  [ShapeType.Polygon]: Polygon as ShapeFC<Shape>,
  [ShapeType.Mask]: Mask as ShapeFC<Shape>,
};

/**
 * Tool preview component for each tool
 *
 * This component renders on the canvas to provide the UI when using a tool.
 * It can be different from the shape that is created by the tool,
 * i.e. if the tool provides additional UI.
 */
const defaultPreviewRegistry: Record<Tool, PreviewFC<unknown> | undefined> = {
  [Tool.Pen]: PenPreview as PreviewFC<unknown>,
  [Tool.Circle]: CirclePreview as PreviewFC<unknown>,
  [Tool.Rectangle]: undefined,
  [Tool.Polygon]: PolygonPreview as PreviewFC<unknown>,
  [Tool.Edit]: undefined,
  [Tool.Segment]: undefined,
};

/**
 * Tool pane component for each tool
 *
 * This component renders the configuration pane for a tool,
 * where the user can adjust the tool's behaviour.
 */
const defaultConfigPaneRegistry: Record<Tool, FC | undefined> = {
  [Tool.Pen]: undefined,
  [Tool.Circle]: undefined,
  [Tool.Rectangle]: undefined,
  [Tool.Polygon]: undefined,
  [Tool.Edit]: undefined,
  [Tool.Segment]: SegmentPane,
};

/**
 * Thunks map for different tools
 *
 * Provides the logic behind each tool, like activation,
 * gesture handling as well as shape and annotation creation.
 */
const defaultThunksRegistry: Record<Tool, ToolThunks | undefined> = {
  [Tool.Pen]: penThunks,
  [Tool.Circle]: circleThunks,
  [Tool.Rectangle]: undefined,
  [Tool.Polygon]: polygonThunks,
  [Tool.Edit]: undefined,
  [Tool.Segment]: undefined,
};

/// Cursor for different tools
const defaultCursorMap: Record<Tool, string | undefined> = {
  [Tool.Pen]: undefined,
  [Tool.Circle]: undefined,
  [Tool.Rectangle]: undefined,
  [Tool.Polygon]: undefined,
  [Tool.Edit]: "pointer",
  [Tool.Segment]: undefined,
};

const defaultRegistry = {
  shapeRegistry: defaultShapeRegistry,
  previewRegistry: defaultPreviewRegistry,
  configPaneRegistry: defaultConfigPaneRegistry,
  thunksRegistry: defaultThunksRegistry,
  cursorMap: defaultCursorMap,
};

/// Provides a discriminated tool state type
export type ToolboxOperationState =
  | ({ tool: Tool.Circle } & CircleToolState)
  | ({ tool: Tool.Pen } & PenToolState)
  | ({ tool: Tool.Polygon } & PolygonToolState)
  | undefined;

export const useRegistry = () => {
  return defaultRegistry;
};
