import { GestureEvent } from "./events";
import { ToolInfo } from "./toolbox";
import { Label } from "../../../api/openApi";
import { AppDispatch, RootState } from "../../../app/store";

export type ToolboxThunkApi = {
  dispatch: AppDispatch;
  getState: () => RootState;
  getInfo: <I>() => I;
};

export type ToolboxThunk<P> = (payload: P, thunkApi: ToolboxThunkApi) => void;

export type ToolApi = {
  requestLabel: () => void;
  cancelLabel: () => void;
};

export type ToolThunk<P> = (
  payload: P,
  thunkApi: ToolboxThunkApi,
  toolApi: ToolApi
) => void;

export type ToolActivatePayload = void;
export type ToolConfigurePayload = { config: unknown };
export type ToolGesturePayload = { gesture: GestureEvent };
export type ToolLabelPayload = { label: Label | undefined };

export type ToolThunks = {
  activate?: ToolboxThunk<ToolActivatePayload>;
  configure?: ToolboxThunk<ToolConfigurePayload>;
  gesture?: ToolThunk<ToolGesturePayload>;
  label?: ToolThunk<ToolLabelPayload>;
};

export type ToolInfoSelector<S> = (state: S) => ToolInfo;

export type ToolSelectors<S = unknown> = {
  info: ToolInfoSelector<S>;
};
