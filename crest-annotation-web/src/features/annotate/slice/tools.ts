import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Label } from "../../../api/openApi";
import { RootState } from "../../../app/store";
import { SegmentConfig } from "../tools/segment";
import { Modifiers, Tool, ToolStatus } from "../types/tools";

export interface ActiveSlice {
  tool: Tool;
  modifiers: Modifiers[];
  labelId?: string;
}

export interface ToolSlice<C> {
  status: ToolStatus;
  config: C;
}

export interface ToolsSlice {
  [Tool.Pen]: ToolSlice<undefined>;
  [Tool.Circle]: ToolSlice<undefined>;
  [Tool.Rectangle]: ToolSlice<undefined>;
  [Tool.Polygon]: ToolSlice<undefined>;
  [Tool.Edit]: ToolSlice<undefined>;
  [Tool.Segment]: ToolSlice<SegmentConfig>;

  active: ActiveSlice;
}

const initialState: ToolsSlice = {
  [Tool.Pen]: { status: ToolStatus.Ready, config: undefined },
  [Tool.Circle]: { status: ToolStatus.Ready, config: undefined },
  [Tool.Rectangle]: { status: ToolStatus.Ready, config: undefined },
  [Tool.Polygon]: { status: ToolStatus.Ready, config: undefined },
  [Tool.Edit]: { status: ToolStatus.Ready, config: undefined },
  [Tool.Segment]: { status: ToolStatus.Ready, config: {} },

  active: {
    tool: Tool.Pen,
    modifiers: [],
    labelId: undefined,
  },
};

// extend typings as needed
type ConfigPayload = {
  tool: Tool.Segment;
  config: Partial<SegmentConfig>;
};

const except = <T>(items: T[], item: T) => items.filter((i) => i !== item);

export const slice = createSlice({
  name: "tools",
  initialState,
  reducers: {
    updateToolState: (
      state,
      action: PayloadAction<{ tool: Tool.Segment; status: ToolStatus }>
    ) => {
      state[action.payload.tool] = {
        ...state[action.payload.tool],
        status: action.payload.status,
      };
    },
    updateToolConfig: (state, action: PayloadAction<ConfigPayload>) => {
      state[action.payload.tool] = {
        ...state[action.payload.tool],
        config: {
          // patch the configuration
          ...state[action.payload.tool].config,
          ...action.payload.config,
        },
      };
    },
    setActiveTool: (state, action: PayloadAction<Tool>) => {
      state.active.tool = action.payload;
    },
    setActiveModifiers: (state, action: PayloadAction<Modifiers[]>) => {
      state.active.modifiers = action.payload;
    },
    setActiveLabel: (state, action: PayloadAction<Label | undefined>) => {
      state.active.labelId = action.payload?.id;
    },
    setActiveModifier: (
      state,
      action: PayloadAction<{ modifier: Modifiers; state: boolean }>
    ) => {
      const includes = state.active.modifiers.includes(action.payload.modifier);
      if (action.payload.state && !includes)
        state.active.modifiers.push(action.payload.modifier);
      if (!action.payload.state && includes)
        state.active.modifiers = except(
          state.active.modifiers,
          action.payload.modifier
        );
    },
    toggleActiveModifier: (state, action: PayloadAction<Modifiers>) => {
      if (state.active.modifiers.includes(action.payload))
        state.active.modifiers = except(state.active.modifiers, action.payload);
      else state.active.modifiers.push(action.payload);
    },
  },
});

export const {
  updateToolState,
  updateToolConfig,
  setActiveTool,
  setActiveModifiers,
  setActiveLabel,
  setActiveModifier,
  toggleActiveModifier,
} = slice.actions;

export const selectActiveTool = (state: RootState) => state.tools.active.tool;
export const selectActiveModifiers = (state: RootState) =>
  state.tools.active.modifiers;
export const selectActiveLabelId = (state: RootState) =>
  state.tools.active.labelId;
export const selectToolStates = (state: RootState) => state.tools;

export default slice.reducer;
