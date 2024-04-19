import { Operation } from "../../types/operation";
import { Tool, ToolStatus } from "../../types/toolbox";

export type Algorithm = { id: string; name: string };

export interface CvToolConfig {
  backend: string;
  state: boolean;
  algorithms: Algorithm[];
  algorithm: string;
  // algorithm specific config
  details: { [key: string]: unknown };
}

export interface CvToolInfo {
  status: ToolStatus;
  config?: CvToolConfig;
}

export interface CvToolState {
  readonly tool: Tool.Cv;
  readonly interface: string;
  // allow custom properties
  [key: string]: unknown;
}

export type CvToolOperation = Operation<"tool/cv", CvToolState>;
