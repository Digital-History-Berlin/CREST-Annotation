import { Operation } from "../../types/operation";
import { Tool, ToolStatus } from "../../types/toolbox";

/// Algorithm information as provided by backend
export type Algorithm = {
  id: string;
  name: string;
  frontend: string;
};

/// Backend configuration (algorithm independent)
export interface CvBackendConfig {
  url: string;
  state: boolean;
  algorithms: Algorithm[];
}

/// The complete tool information
export interface CvToolInfo {
  status: ToolStatus;
  backend?: CvBackendConfig;
  algorithm?: string;
  config?: unknown;
  data?: unknown;
}

/// The state of the current operation
export interface CvToolState {
  readonly tool: Tool.Cv;
  // allow custom properties
  [key: string]: unknown;
}

export type CvToolOperation = Operation<"tool/cv", CvToolState>;
