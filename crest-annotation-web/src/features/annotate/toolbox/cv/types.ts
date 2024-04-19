import { Operation } from "../../types/operation";
import { Tool, ToolStatus } from "../../types/toolbox";

/// Algorithm information as provided by backend
export type Algorithm = {
  id: string;
  name: string;
  frontend: string;
};

export interface CvBackendConfig {
  url: string;
  state: boolean;
  algorithms: Algorithm[];
}

export interface CvToolConfig {
  // allow custom properties
  [key: string]: unknown;
}

export interface CvToolInfo {
  status: ToolStatus;
  backend?: CvBackendConfig;
  algorithm?: string;
  config?: CvToolConfig;
  // allow custom properties
  [key: string]: unknown;
}

export interface CvToolState {
  readonly tool: Tool.Cv;
  // allow custom properties
  [key: string]: unknown;
}

export type CvToolOperation = Operation<"tool/cv", CvToolState>;
