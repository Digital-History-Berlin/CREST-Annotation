import SegmentPane from "./SegmentPane";
import { Tool } from "../../slice/tools";

export const toolPaneMap = {
  [Tool.Pen]: undefined,
  [Tool.Circle]: undefined,
  [Tool.Rectangle]: undefined,
  [Tool.Polygon]: undefined,
  [Tool.Edit]: undefined,
  [Tool.Segment]: SegmentPane,
};
