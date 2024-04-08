import { FC } from "react";
import { Preview as CirclePreview } from "./circle/Preview";
import { circleThunks } from "./circle/thunks";
import { CircleToolOperation } from "./circle/types";
import { Preview as PenPreview } from "./pen/Preview";
import { penThunks } from "./pen/thunks";
import { PenToolOperation } from "./pen/types";
import { Preview as PolygonPreview } from "./polygon/Preview";
import { polygonThunks } from "./polygon/thunks";
import { PolygonToolOperation } from "./polygon/types";
import { Preview as RectanglePreview } from "./rectangle/Preview";
import { rectangleThunks } from "./rectangle/thunks";
import { RectangleToolOperation } from "./rectangle/types";
import { Configuration as SegmentConfiguration } from "./segment/Configuration";
import { Circle } from "../components/shapes/Circle";
import { Line } from "../components/shapes/Line";
import { Mask } from "../components/shapes/Mask";
import { Polygon } from "../components/shapes/Polygon";
import { Rectangle } from "../components/shapes/Rectangle";
import { PreviewFC } from "../types/preview";
import { ShapeFC, ShapeType } from "../types/shapes";
import { ToolThunks } from "../types/thunks";
import { Tool } from "../types/toolbox";

/**
 * Shape component for each shape type
 *
 * This component renders shapes for existing annotations on the canvas.
 * It is different from the UI that is provided with the tools.
 */
export const shapeRegistry: Record<ShapeType, ShapeFC | undefined> = {
  [ShapeType.Line]: Line as ShapeFC,
  [ShapeType.Circle]: Circle as ShapeFC,
  [ShapeType.Rectangle]: Rectangle as ShapeFC,
  [ShapeType.Polygon]: Polygon as ShapeFC,
  [ShapeType.Mask]: Mask as ShapeFC,
};

/**
 * Tool preview component for each tool
 *
 * This component renders on the canvas to provide the UI when using a tool.
 * It can be different from the shape that is created by the tool,
 * i.e. if the tool provides additional UI.
 */
export const previewRegistry: Record<Tool, PreviewFC | undefined> = {
  [Tool.Pen]: PenPreview as PreviewFC,
  [Tool.Circle]: CirclePreview as PreviewFC,
  [Tool.Rectangle]: RectanglePreview as PreviewFC,
  [Tool.Polygon]: PolygonPreview as PreviewFC,
  [Tool.Edit]: undefined,
  [Tool.Segment]: undefined,
};

/**
 * Tool pane component for each tool
 *
 * This component renders the configuration pane for a tool,
 * where the user can adjust the tool's behaviour.
 */
export const configPaneRegistry: Record<Tool, FC | undefined> = {
  [Tool.Pen]: undefined,
  [Tool.Circle]: undefined,
  [Tool.Rectangle]: undefined,
  [Tool.Polygon]: undefined,
  [Tool.Edit]: undefined,
  [Tool.Segment]: SegmentConfiguration,
};

/// Cursor for different tools
export const defaultCursorMap: Record<Tool, string | undefined> = {
  [Tool.Pen]: undefined,
  [Tool.Circle]: undefined,
  [Tool.Rectangle]: undefined,
  [Tool.Polygon]: undefined,
  [Tool.Edit]: "pointer",
  [Tool.Segment]: undefined,
};
/**
 * Thunks map for different tools
 *
 * Provides the logic behind each tool, like activation,
 * gesture handling as well as shape and annotation creation.
 */
export const thunksRegistry: Record<Tool, ToolThunks | undefined> = {
  [Tool.Pen]: penThunks,
  [Tool.Circle]: circleThunks,
  [Tool.Rectangle]: rectangleThunks,
  [Tool.Polygon]: polygonThunks,
  [Tool.Edit]: undefined,
  [Tool.Segment]: undefined,
};

/// Combination of available tool operation
export type ToolboxOperation =
  | CircleToolOperation
  | PenToolOperation
  | PolygonToolOperation
  | RectangleToolOperation;
