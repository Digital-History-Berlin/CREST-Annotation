import { Operation } from "../../types/operation";
import { Tool, ToolStatus } from "../../types/toolbox";

/// Algorithm information as provisded by backend
export type CvAlgorithm = {
  id: string;
  name: string;
  frontend: string;
};

/// Backend configuration (algorithm independent)
export interface CvBackendConfig {
  url: string;
  state: boolean;
  algorithms?: CvAlgorithm[];
}

export type CvAlgorithmState = CvAlgorithm & {
  state: boolean;
};

/// The operation-independent tool state
export interface CvToolState<C = unknown, D = unknown> {
  status: ToolStatus;
  backend?: CvBackendConfig;
  algorithm?: CvAlgorithmState;
  config?: C;
  data?: D;
}

/// The state of the current operation
export interface CvToolOperationState {
  readonly tool: Tool.Cv;
  // additional discriminator
  readonly task?: string;
}

export type CvToolOperation = Operation<"tool/cv", CvToolOperationState>;
