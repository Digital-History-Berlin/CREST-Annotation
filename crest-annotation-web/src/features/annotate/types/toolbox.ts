export enum Tool {
  // edit existing shapes
  Edit = "Edit",
  // simple shape tools
  Pen = "Pen",
  Circle = "Circle",
  Rectangle = "Rectangle",
  Polygon = "Polygon",
  // open-cv backend with inference running on the backend
  Cv = "Cv",
  // open-cv backend with ONNX frontend inference
  Onnx = "Onnx",
}

export enum ToolGroup {
  Edit = "Edit",
  Shape = "Shape",
  Backend = "Backend",
}

export enum ToolStatus {
  Failed = "Failed",
  Loading = "Loading",
  Ready = "Ready",
}

export interface ToolIcon {
  name: string;
  style: unknown;
  tooltip: string;
}

export interface ToolInfo {
  group: ToolGroup;
  status: ToolStatus;
  icon: ToolIcon;
}

export enum Modifiers {
  // group created shapes
  Group = "Group",
}
