import { CvToolState } from "./types";
import { Tool, ToolStateError, ToolStatus } from "../../types/toolbox";
import { ToolboxThunk } from "../../types/toolbox-thunks";
import { ToolLoaderThunk, createLoaderThunk } from "../create-async-tool";

// creates an asynchronous tool preparation thunk
// (simplified version for CV tool state)
export const cvCreateLoaderThunk = <T extends CvToolState>(
  options: { name?: string; progress?: number },
  thunk: ToolLoaderThunk<T, T["config"]>
): ToolboxThunk<{ state: T | undefined; config: T["config"] }> =>
  createLoaderThunk({ tool: Tool.Cv, ...options }, thunk);

// validate and select the tool state for a given frontend
export const cvToolState = <S extends CvToolState>(
  state: unknown,
  frontend: string,
  ready = true
) => {
  const cv = state as CvToolState | undefined;

  if (cv === undefined)
    throw new ToolStateError(Tool.Cv, "Tool configuration not found");
  if (cv.backend === undefined)
    throw new ToolStateError(Tool.Cv, "Missing backend configuration");
  if (cv.algorithm?.frontend !== frontend)
    throw new ToolStateError(Tool.Cv, "Incorrect frontend");
  if (ready && cv.status !== ToolStatus.Ready)
    throw new ToolStateError(Tool.Cv, "Tool not ready");

  return {
    backend: cv.backend,
    algorithm: cv.algorithm,
    config: cv.config as S["config"],
    data: cv.data as S["data"],
  };
};
