import { GestureEvent } from "./events";
import { Label } from "../../../api/openApi";
import { ToolCallbacks, ToolThunk } from "../hooks/use-tool-controller";
import {
  ToolboxOperationController,
  ToolboxThunk,
} from "../hooks/use-toolbox-controller";

export type ToolActivatePayload = { config: unknown };
export type ToolConfigurePayload = { config: unknown };
export type ToolGesturePayload = { gesture: GestureEvent };
export type ToolLabelPayload = { label: Label | undefined };

export type ToolThunks = {
  activate?: ToolboxThunk<ToolActivatePayload>;
  configure?: ToolThunk<ToolConfigurePayload>;
  gesture?: ToolThunk<ToolGesturePayload>;
  label?: ToolThunk<ToolLabelPayload>;
};

export type ToolGestureThunk = (
  gesture: GestureEvent,
  controller: ToolboxOperationController,
  callbacks: ToolCallbacks
) => void;
