import { Key } from "react";
import { GestureEvent } from "./events";
import { ToolInfo } from "./toolbox";
import { Label } from "../../../api/openApi";
import { AppDispatch, RootState } from "../../../app/store";
import { MaybePromise } from "../../../types/maybe-promise";

export type ToolboxThunkApi = {
  dispatch: AppDispatch;
  getState: () => RootState;
  // shorthand to access the tool state
  getToolState: <T>() => T | undefined;
};

export type ToolboxThunk<P> = (
  payload: P,
  thunkApi: ToolboxThunkApi
) => MaybePromise<void>;

export type ToolApi = {
  requestLabel: () => void;
  cancelLabel: () => void;
};

export type ToolThunk<P> = (
  payload: P,
  thunkApi: ToolboxThunkApi,
  toolApi: ToolApi
) => MaybePromise<void>;

export type CustomToolThunk<P> = (
  payload: P,
  thunkApi: ToolboxThunkApi
) => MaybePromise<void>;

export type ToolActivatePayload = void;
export type ToolConfigurePayload = { config: unknown };
export type ToolGesturePayload = { gesture: GestureEvent };
export type ToolLabelPayload = { label: Label | undefined };
export type ToolKeyPayload = { key: Key };

export type ToolThunks = {
  activate?: ToolboxThunk<ToolActivatePayload>;
  configure?: ToolboxThunk<ToolConfigurePayload>;
  gesture?: ToolThunk<ToolGesturePayload>;
  label?: ToolThunk<ToolLabelPayload>;
  key?: ToolThunk<ToolKeyPayload>;
};

export type ToolInfoSelector<S> = (state: S) => ToolInfo;

export type ToolSelectors<S = unknown> = {
  info: ToolInfoSelector<S>;
};
