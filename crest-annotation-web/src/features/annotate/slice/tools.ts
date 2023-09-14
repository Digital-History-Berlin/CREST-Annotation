import { AnyAction, PayloadAction, createSlice } from "@reduxjs/toolkit";
import { addAnnotation } from "./annotations";
import { Label } from "../../../api/openApi";
import { RootState } from "../../../app/store";

export enum Tool {
  Edit = "Edit",
  Pen = "Pen",
  Circle = "Circle",
  Rectangle = "Rectangle",
  Polygon = "Polygon",
  Segment = "Segment",
}

export enum Modifiers {
  Group = "Group",
}

export enum ToolState {
  Preparing = "Preparing",
  Ready = "Ready",
  Failed = " Failed",
}

export interface SegmentConfig {
  backend?: string;
  algorithm?: string;
  // algorithm specific config
  details?: { [key: string]: unknown };
}

export interface ToolsSlice {
  activeTool: { tool: Tool; state: ToolState; config?: unknown };
  activeModifiers: Modifiers[];
  activeLabelId?: string;
  // modifier specific data
  groupAnnotationId?: string;
  // tool specific configurations
  // (can be changed by the user)
  toolConfigs: {
    [Tool.Pen]: undefined;
    [Tool.Circle]: undefined;
    [Tool.Rectangle]: undefined;
    [Tool.Polygon]: undefined;
    [Tool.Edit]: undefined;
    [Tool.Segment]: SegmentConfig;
  };
}

const initialState: ToolsSlice = {
  activeTool: { tool: Tool.Pen, state: ToolState.Ready },
  activeModifiers: [],
  toolConfigs: {
    [Tool.Pen]: undefined,
    [Tool.Circle]: undefined,
    [Tool.Rectangle]: undefined,
    [Tool.Polygon]: undefined,
    [Tool.Edit]: undefined,
    [Tool.Segment]: {},
  },
};

const except = <T>(items: T[], item: T) => items.filter((i) => i !== item);

// actions that change the modifiers
const isModifierMutation = (action: AnyAction) =>
  ["tools/setModifiers", "tools/setModifier", "tools/toggleModifier"].includes(
    action.type
  );

// actions that change the active label
const isLabelChange = (action: AnyAction) =>
  ["tools/setActiveLabel"].includes(action.type);

export const slice = createSlice({
  name: "tools",
  initialState,
  reducers: {
    setActiveTool: (state, action: PayloadAction<Tool>) => {
      state.activeTool = {
        tool: action.payload,
        state: ToolState.Ready,
        config: undefined,
      };
    },
    prepareActiveTool: (state, action: PayloadAction<Tool>) => {
      state.activeTool = {
        tool: action.payload,
        state: ToolState.Preparing,
        config: undefined,
      };
    },
    updateActiveTool: (
      state,
      action: PayloadAction<{ state: ToolState; config?: unknown }>
    ) => {
      state.activeTool.state = action.payload.state;
      state.activeTool.config = action.payload.config;
    },
    setActiveLabel: (state, action: PayloadAction<Label | undefined>) => {
      state.activeLabelId = action.payload?.id;
    },
    setModifiers: (state, action: PayloadAction<Modifiers[]>) => {
      state.activeModifiers = action.payload;
    },
    setModifier: (
      state,
      action: PayloadAction<{ modifier: Modifiers; state: boolean }>
    ) => {
      const includes = state.activeModifiers.includes(action.payload.modifier);
      if (action.payload.state && !includes)
        state.activeModifiers.push(action.payload.modifier);
      if (!action.payload.state && includes)
        state.activeModifiers = except(
          state.activeModifiers,
          action.payload.modifier
        );
    },
    toggleModifier: (state, action: PayloadAction<Modifiers>) => {
      if (state.activeModifiers.includes(action.payload))
        state.activeModifiers = except(state.activeModifiers, action.payload);
      else state.activeModifiers.push(action.payload);
    },
    updateToolConfig: (
      state,
      // TODO: add typings for other tools as needed
      action: PayloadAction<{
        tool: Tool.Segment;
        config: Partial<SegmentConfig>;
      }>
    ) => {
      // patch the state
      state.toolConfigs[action.payload.tool] = {
        ...state.toolConfigs[action.payload.tool],
        ...action.payload.config,
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addAnnotation, (state, action) => {
      if (
        state.activeModifiers.includes(Modifiers.Group) &&
        !state.groupAnnotationId
      )
        // use new annotation for group
        state.groupAnnotationId = action.payload.id;
    });
    builder.addMatcher(isLabelChange, (state) => {
      if (state.groupAnnotationId) {
        // deactivate group modifier on label change (if already in progress)
        state.activeModifiers = except(state.activeModifiers, Modifiers.Group);
        state.groupAnnotationId = undefined;
      }
    });
    builder.addMatcher(isModifierMutation, (state) => {
      if (!state.activeModifiers.includes(Modifiers.Group))
        state.groupAnnotationId = undefined;
    });
  },
});

export const {
  setActiveTool,
  prepareActiveTool,
  updateActiveTool,
  setActiveLabel,
  setModifiers,
  setModifier,
  toggleModifier,
  updateToolConfig,
} = slice.actions;

// tools
export const selectActiveTool = (state: RootState) => state.tools.activeTool;
export const selectActiveLabelId = (state: RootState) =>
  state.tools.activeLabelId;
export const selectActiveModifiers = (state: RootState) =>
  state.tools.activeModifiers;

// modifier specific data
export const selectGroupAnnotationId = (state: RootState) =>
  state.tools.groupAnnotationId;

export default slice.reducer;
