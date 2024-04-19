import { Operation } from "../../types/operation";
import { PreviewFC } from "../../types/preview";
import {
  ToolGesturePayload,
  ToolLabelPayload,
  ToolThunk,
} from "../../types/thunks";
import { Tool, ToolStatus } from "../../types/toolbox";

export type Algorithm = { id: string; name: string };

export interface CvToolConfig {
  backend: string;
  state: boolean;
  algorithms: Algorithm[];
  algorithm: string;
  // allow custom properties
  [key: string]: unknown;
}

export interface CvToolInfo {
  status: ToolStatus;
  config?: CvToolConfig;
  // custom tool interface
  interface?: string;
  preview?: PreviewFC;
  gesture?: ToolThunk<ToolGesturePayload>;
  label?: ToolThunk<ToolLabelPayload>;
}

export interface CvToolState {
  readonly tool: Tool.Cv;
  readonly interface: string;
  // allow custom properties
  [key: string]: unknown;
}

export type CvToolOperation = Operation<"tool/cv", CvToolState>;
