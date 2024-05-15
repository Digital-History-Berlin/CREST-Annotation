import { createAsyncThunk } from "@reduxjs/toolkit";
import { CvToolOperation, CvToolState } from "./types";
import { AppDispatch, RootState } from "../../../../app/store";
import { MaybePromise } from "../../../../types/maybe-promise";
import { isOperationOfType } from "../../slice/operation";
import {
  ToolApi,
  ToolThunk,
  ToolboxThunk,
  ToolboxThunkApi,
} from "../../types/thunks";
import { Tool, ToolStateError, ToolStatus } from "../../types/toolbox";
import { ToolLoaderThunk, createLoaderThunk } from "../async-tool";

// creates an asynchronous tool preparation thunk
// (simplified version for CV tool state)
export const cvCreateLoaderThunk = <T extends CvToolState>(
  options: { name?: string; progress?: number },
  thunk: ToolLoaderThunk<T, T["config"]>
): ToolboxThunk<{ state: T | undefined; config: T["config"] }> =>
  createLoaderThunk({ tool: Tool.Cv, ...options }, thunk);

export type CvToolThunk<P, O> = (
  payload: P,
  operation: O | undefined,
  thunkApi: ToolboxThunkApi,
  toolApi: ToolApi
) => void;

// create a bare tool thunk with immediate operation state access
// (extended version for CV tool operations)
export const cvCreateToolThunk =
  <P, O extends CvToolOperation>(
    options: { task: O["state"]["task"] },
    thunk: CvToolThunk<P, O>
  ): ToolThunk<P> =>
  (payload, thunkApi, toolApi) => {
    const {
      operation: { current },
    } = thunkApi.getState();

    const operation =
      isOperationOfType<O>(current, "tool/cv") &&
      current.state.task === options.task
        ? current
        : undefined;

    return thunk(payload, operation, thunkApi, toolApi);
  };

export type CvCustomThunkApi = {
  dispatch: AppDispatch;
  getState: () => RootState;
};

export type CvCustomThunk<P, O> = (
  payload: P,
  operation: O | undefined,
  thunkApi: CvCustomThunkApi
) => MaybePromise<void>;

// create a custom thunk with immediate operation state access
// (for use directly from tool UI components)
export const cvCreateCustomThunk = <P, O extends CvToolOperation>(
  prefix: string,
  options: { task: O["state"]["task"] },
  thunk: CvCustomThunk<P, O>
) =>
  createAsyncThunk<void, P, { state: RootState; dispatch: AppDispatch }>(
    prefix,
    async (payload, thunkApi) => {
      const {
        operation: { current },
      } = thunkApi.getState();

      const operation =
        isOperationOfType<O>(current, "tool/cv") &&
        current.state.task === options.task
          ? current
          : undefined;

      return thunk(payload, operation, thunkApi);
    }
  );

// validate and select the tool state for a given frontend
export const cvToolState = <S extends CvToolState>(
  state: RootState,
  frontend: string
) => {
  const { toolbox } = state;
  const cv = toolbox.tools[Tool.Cv] as S | undefined;

  if (
    !cv?.backend ||
    cv.status !== ToolStatus.Ready ||
    cv.algorithm?.frontend !== frontend
  )
    throw new ToolStateError(Tool.Cv, cv);

  return {
    backend: cv.backend,
    algorithm: cv.algorithm,
    config: cv.config as S["config"],
    data: cv.data as S["data"],
  };
};
