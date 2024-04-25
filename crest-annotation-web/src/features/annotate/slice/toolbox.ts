import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Label } from "../../../api/openApi";
import { AppDispatch, RootState } from "../../../app/store";
import { thunksRegistry } from "../toolbox";
import { GestureEvent } from "../types/events";
import { ToolApi, ToolboxThunkApi } from "../types/thunks";
import { Modifiers, Tool } from "../types/toolbox";

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
  resetToolState,
  updateToolState,
  updateToolboxSelection,
  setToolboxTool,
  setToolboxLabel,
  toggleToolboxLabel,
  setToolboxModifier,
  toggleToolboxModifier,
} = slice.actions;

export default slice.reducer;

const getOperationTool = (state: RootState) => {
  const {
    toolbox: { selection },
    operation: { current },
  } = state;

  // proceed with operation tool if available
  return current?.type.startsWith("tool/")
    ? current.state.tool
    : selection.tool;
};

type PartialAppThunkApi = {
  dispatch: AppDispatch;
  getState: () => RootState;
};

const toolboxApi = (
  { dispatch, getState }: PartialAppThunkApi,
  tool: Tool
): ToolboxThunkApi => ({
  dispatch,
  getState,
  // shorthand to retrieve the tool info (config)
  getInfo: <I>() => getState().toolbox.tools[tool] as I,
});

export const activateTool = createAsyncThunk<
  void,
  { tool: Tool },
  { state: RootState; dispatch: AppDispatch }
>("toolbox/activateTool", ({ tool }, api) => {
  console.debug("Activate tool: ", tool);

  const thunks = thunksRegistry[tool];
  const toolbox = toolboxApi(api, tool);
  return thunks?.activate?.(undefined, toolbox);
});

export const configureTool = createAsyncThunk<
  void,
  { tool: Tool; config: unknown },
  { state: RootState; dispatch: AppDispatch }
>("toolbox/activateTool", ({ tool, config }, api) => {
  console.debug("Configure tool: ", tool, config);

  const thunks = thunksRegistry[tool];
  const toolbox = toolboxApi(api, tool);
  return thunks?.configure?.({ config }, toolbox);
});

export const processGesture = createAsyncThunk<
  void,
  { gesture: GestureEvent; toolApi: ToolApi },
  { state: RootState; dispatch: AppDispatch }
>("toolbox/processGesture", ({ gesture, toolApi }, api) => {
  const tool = getOperationTool(api.getState());
  const thunks = thunksRegistry[tool];
  const toolbox = toolboxApi(api, tool);
  return thunks?.gesture?.({ gesture }, toolbox, toolApi);
});

export const processLabel = createAsyncThunk<
  void,
  { label?: Label; toolApi: ToolApi },
  { state: RootState; dispatch: AppDispatch }
>("toolbox/processLabel", ({ label, toolApi }, api) => {
  console.debug("Process label: ", label);

  const tool = getOperationTool(api.getState());
  const thunks = thunksRegistry[tool];
  const toolbox = toolboxApi(api, tool);
  return thunks?.label?.({ label }, toolbox, toolApi);
});
