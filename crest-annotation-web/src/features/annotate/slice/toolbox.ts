import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Label } from "../../../api/openApi";
import { RootState } from "../../../app/store";
import { MaybePromise } from "../../../types/maybe-promise";
import { PartialAppThunkApi, createAppAsyncThunk } from "../../../types/thunks";
import { thunksRegistry } from "../toolbox";
import { isOperationOfGroup } from "../types/operation";
import { Modifiers, Tool } from "../types/toolbox";
import { ToolOperation } from "../types/toolbox-operations";
import {
  ToolApi,
  ToolConfigurePayload,
  ToolGesturePayload,
  ToolKeyPayload,
  ToolLabelPayload,
  ToolboxThunkApi,
} from "../types/toolbox-thunks";

export interface ToolboxSlice {
  tools: Record<Tool, unknown>;
  // active selection
  selection: {
    tool: Tool;
    modifiers: Modifiers[];
    labelId?: string;
  };
}

const initialState: ToolboxSlice = {
  tools: {
    [Tool.Pen]: undefined,
    [Tool.Circle]: undefined,
    [Tool.Rectangle]: undefined,
    [Tool.Polygon]: undefined,
    [Tool.Edit]: undefined,
    [Tool.Cv]: undefined,
  },
  // active selection
  selection: {
    tool: Tool.Pen,
    modifiers: [],
    labelId: undefined,
  },
};

const except = <T>(items: T[], item: T) => items.filter((i) => i !== item);

export const slice = createSlice({
  name: "tools",
  initialState,
  reducers: {
    resetToolState: (
      state,
      action: PayloadAction<{ tool: Tool; state: unknown }>
    ) => {
      state.tools[action.payload.tool] = action.payload.state;
    },
    updateToolState: (
      state,
      action: PayloadAction<{ tool: Tool; state: unknown }>
    ) => {
      const current = state.tools[action.payload.tool];
      const patch = action.payload.state;
      // partial update (if possible)
      if (typeof current === "object" && typeof patch === "object")
        state.tools[action.payload.tool] = {
          ...current,
          ...patch,
        };
    },
    updateToolboxSelection: (
      state,
      action: PayloadAction<{
        tool?: Tool;
        modifier: Modifiers[];
        labelId?: string;
      }>
    ) => {
      state.selection = { ...state.selection, ...action.payload };
    },
    setToolboxTool: (state, action: PayloadAction<Tool>) => {
      state.selection.tool = action.payload;
    },
    setToolboxLabel: (state, action: PayloadAction<Label | undefined>) => {
      state.selection.labelId = action.payload?.id;
    },
    toggleToolboxLabel: (state, action: PayloadAction<Label>) => {
      if (state.selection.labelId === action.payload.id)
        state.selection.labelId = undefined;
      else state.selection.labelId = action.payload.id;
    },
    setToolboxModifier: (
      state,
      action: PayloadAction<{ modifier: Modifiers; state: boolean }>
    ) => {
      const includes = state.selection.modifiers.includes(
        action.payload.modifier
      );
      if (action.payload.state && !includes)
        state.selection.modifiers.push(action.payload.modifier);
      if (!action.payload.state && includes)
        state.selection.modifiers = except(
          state.selection.modifiers,
          action.payload.modifier
        );
    },
    toggleToolboxModifier: (state, action: PayloadAction<Modifiers>) => {
      if (state.selection.modifiers.includes(action.payload))
        state.selection.modifiers = except(
          state.selection.modifiers,
          action.payload
        );
      else state.selection.modifiers.push(action.payload);
    },
  },
});

export const {
  updateToolboxSelection,
  setToolboxTool,
  setToolboxLabel,
  toggleToolboxLabel,
  setToolboxModifier,
  toggleToolboxModifier,
} = slice.actions;

export const selectToolboxTool = (state: RootState) =>
  state.toolbox.selection.tool;
export const selectToolboxModifiers = (state: RootState) =>
  state.toolbox.selection.modifiers;
export const selectToolboxLabelId = (state: RootState) =>
  state.toolbox.selection.labelId;

export default slice.reducer;

// generic versions to improve type-safety without too many constraints
export const resetToolState = <T>(payload: { tool: Tool; state: T }) =>
  slice.actions.resetToolState(payload);
export const updateToolState = <T>(payload: {
  tool: Tool;
  state: Partial<T>;
}) => slice.actions.updateToolState(payload);

const getTargetTool = (state: RootState): Tool => {
  const {
    toolbox: { selection },
    operation: { current },
  } = state;

  // proceed with operation tool if available
  return isOperationOfGroup<ToolOperation>(current, "tool/")
    ? current.state.tool
    : selection.tool;
};

/**
 * Create the extended toolbox API for the given tool
 *
 * The API is provided to the tool thunks and encapsulates some of the
 * repetitive tasks (like extracting state information).
 */
export const createToolboxApi = (
  { dispatch, getState }: PartialAppThunkApi,
  tool: Tool
): ToolboxThunkApi => ({
  dispatch,
  getState,
  getToolState: <T>() => getState().toolbox.tools[tool] as T | undefined,
});

// tool thunks should catch their exceptions on their own
// make sure uncaught exceptions are logged properly
export const toolboxSandbox =
  (action: string) => (maybePromise: MaybePromise<void> | undefined) =>
    Promise.resolve(maybePromise).catch((error) =>
      console.error(`Uncaught error in ${action} tool thunk`, error)
    );

export const activateTool = createAppAsyncThunk<
  void,
  { tool: Tool | undefined }
>("toolbox/activateTool", ({ tool }, api) => {
  // re-activate current tool if not specified
  const state = api.getState();
  const activate = tool ?? state.toolbox.selection.tool;
  console.debug("Activate tool:", activate);

  const thunks = thunksRegistry[activate];
  const toolbox = createToolboxApi(api, activate);
  const resolve = toolboxSandbox("activate");

  resolve(thunks?.activate?.(undefined, toolbox));
});

export const configureTool = createAppAsyncThunk<
  void,
  { tool: Tool } & ToolConfigurePayload
>("toolbox/activateTool", ({ tool, ...payload }, api) => {
  console.debug("Configure tool:", tool, payload);

  const thunks = thunksRegistry[tool];
  const toolbox = createToolboxApi(api, tool);
  const resolve = toolboxSandbox("configure");

  resolve(thunks?.configure?.(payload, toolbox));
});

export const processGesture = createAppAsyncThunk<
  void,
  { toolApi: ToolApi } & ToolGesturePayload
>("toolbox/processGesture", ({ toolApi, ...payload }, api) => {
  const tool = getTargetTool(api.getState());
  const thunks = thunksRegistry[tool];
  const toolbox = createToolboxApi(api, tool);
  const resolve = toolboxSandbox("gesture");

  resolve(thunks?.gesture?.(payload, toolbox, toolApi));
});

export const processLabel = createAppAsyncThunk<void, ToolLabelPayload>(
  "toolbox/processLabel",
  (payload, api) => {
    console.debug("Process label:", payload);

    const tool = getTargetTool(api.getState());
    const thunks = thunksRegistry[tool];
    const toolbox = createToolboxApi(api, tool);
    const resolve = toolboxSandbox("label");

    resolve(thunks?.label?.(payload, toolbox));
  }
);

export const processKey = createAppAsyncThunk<
  void,
  { toolApi: ToolApi } & ToolKeyPayload
>("toolbox/processKey", ({ toolApi, ...payload }, api) => {
  console.debug("Process key:", payload);

  const tool = getTargetTool(api.getState());
  const thunks = thunksRegistry[tool];
  const toolbox = createToolboxApi(api, tool);
  const resolve = toolboxSandbox("key");

  resolve(thunks?.key?.(payload, toolbox, toolApi));
});
