import { AnyAction, PayloadAction, createSlice } from "@reduxjs/toolkit";
import { addAnnotation } from "./annotations";
import { Label } from "../../../api/openApi";
import { RootState } from "../../../app/store";

export enum Tool {
  Pen,
  Circle,
  Rectangle,
  Polygon,
  Edit,
}

export enum Modifiers {
  Group,
}

export interface ToolsSlice {
  activeTool: Tool;
  activeModifiers: Modifiers[];
  activeLabelId?: string;
  // modifier specific data
  groupAnnotationId?: string;
}

const initialState: ToolsSlice = {
  activeTool: Tool.Pen,
  activeModifiers: [],
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
      state.activeTool = action.payload;
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
  setActiveLabel,
  setModifiers,
  setModifier,
  toggleModifier,
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
