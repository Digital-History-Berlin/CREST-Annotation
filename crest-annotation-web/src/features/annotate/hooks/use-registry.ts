import { FC } from "react";
import { Operation } from "./use-operation-controller";
import SegmentPane from "../components/configs/SegmentPane";
import { CirclePreview } from "../components/previews/CirclePreview";
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
 * This component renders on the canvas to provide the UI,
 * while the tool is in use.
 */
const defaultPreviewRegistry: Record<Tool, PreviewFC<Operation> | undefined> = {
  [Tool.Pen]: undefined,
  [Tool.Circle]: CirclePreview as PreviewFC<Operation>,
  [Tool.Rectangle]: undefined,
  [Tool.Polygon]: undefined,
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
const defaultThunksRegistry: Record<Tool, ToolThunks<Operation> | undefined> = {
  [Tool.Pen]: penThunks as unknown as ToolThunks<Operation>,
  [Tool.Circle]: circleThunks as unknown as ToolThunks<Operation>,
  [Tool.Rectangle]: undefined,
  [Tool.Polygon]: polygonThunks as unknown as ToolThunks<Operation>,
  [Tool.Edit]: undefined,
  [Tool.Segment]: undefined,
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

export const useRegistry = () => {
  return {
    shapeRegistry: defaultShapeRegistry,
    previewRegistry: defaultPreviewRegistry,
    configPaneRegistry: defaultConfigPaneRegistry,
    thunksRegistry: defaultThunksRegistry,
    cursorMap: defaultCursorMap,
  };
};
