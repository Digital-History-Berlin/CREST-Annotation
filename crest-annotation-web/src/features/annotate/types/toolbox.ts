export class ToolStateError extends Error {
  constructor(tool: string, state: unknown) {
    super(`Invalid tool state (${tool}): ${JSON.stringify(state)}`);
  }
}

export enum Tool {
  // edit existing shapes
  Edit = "Edit",
  // basic tools
  Pen = "Pen",
  Circle = "Circle",
  Rectangle = "Rectangle",
  Polygon = "Polygon",
  // computer vision backend
  Cv = "Cv",
}

export enum ToolGroup {
  Edit = "Edit",
  Shape = "Shape",
  Cv = "Cv",
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
