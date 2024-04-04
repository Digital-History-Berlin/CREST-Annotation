import { GestureEvent } from "./events";
import { Shape } from "./shapes";
import { Tool } from "./tools";
import { Label } from "../../../api/openApi";
import { AppDispatch } from "../../../app/store";
import {
  Operation,
  OperationController,
} from "../hooks/use-operation-controller";

export interface ToolThunkManager {
  handleActivate: (tool: Tool) => void;
}

export interface ToolThunkController {
  state: Operation | undefined;
  handleGesture: (gesture: GestureEvent) => void;
  handleLabel: (label: Label) => void;
}

export interface ToolThunkManageCallbacks {
  // direct access to dispatch
  dispatch: AppDispatch;
}

export type ToolThunkCallbacks = ToolThunkManageCallbacks & {
  requestLabel: () => void;
  cancelLabel: () => void;
  emitShape: (shape: Shape) => void;
};

export type ToolThunkManage<P, O extends Operation> = (
  payload: P,
  controller: OperationController<O>,
  callbacks: ToolThunkManageCallbacks
) => void;

export type ToolThunk<P, O extends Operation> = (
  payload: P,
  controller: OperationController<O>,
  callbacks: ToolThunkCallbacks
) => void;

export type ToolActivatePayload = { config: unknown };
export type ToolConfigurePayload = { config: unknown };
export type ToolGesturePayload = { gesture: GestureEvent };
export type ToolLabelPayload = { label: Label };

export type ToolThunks<O extends Operation> = {
  activate?: ToolThunkManage<ToolActivatePayload, O>;
  configure?: ToolThunk<ToolConfigurePayload, O>;
  gesture?: ToolThunk<ToolGesturePayload, O>;
  label?: ToolThunk<ToolLabelPayload, O>;
};
