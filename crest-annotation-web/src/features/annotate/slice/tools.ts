import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Annotation, addAnnotation, deleteAnnotation } from "./annotations";
import { Label } from "../../../api/openApi";
import { RootState } from "../../../app/store";

export enum Tool {
  Select,
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
  activeAnnotationId?: string;
}

const initialState: ToolsSlice = {
  activeTool: Tool.Pen,
  activeModifiers: [],
};

const except = <T>(items: T[], item: T) => items.filter((i) => i !== item);

export const slice = createSlice({
  name: "tools",
  initialState,
  reducers: {
    setActiveTool: (state, action: PayloadAction<Tool>) => {
      state.activeTool = action.payload;
    },
    setActiveLabel: (state, action: PayloadAction<Label | undefined>) => {
      state.activeLabelId = action.payload?.id;
      // disable group tool if it was active (label must stay same)
      state.activeModifiers = except(state.activeModifiers, Modifiers.Group);
    },
    setActiveAnnotation: (
      state,
      action: PayloadAction<Annotation | undefined>
    ) => {
      state.activeAnnotationId = action.payload?.id;
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
  extraReducers(builder) {
    builder.addCase(addAnnotation, (state, action) => {
      // added annotation becomes active
      state.activeAnnotationId = action.payload.id;
    });
    builder.addCase(deleteAnnotation, (state, action) => {
      // check if active annotation was deleted
      if (state.activeAnnotationId === action.payload.id)
        state.activeAnnotationId = undefined;
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

export const selectActiveTool = (state: RootState) => state.tools.activeTool;
export const selectActiveLabelId = (state: RootState) =>
  state.tools.activeLabelId;
export const selectActiveAnnotationId = (state: RootState) =>
  state.tools.activeAnnotationId;
export const selectActiveModifiers = (state: RootState) =>
  state.tools.activeModifiers;

export default slice.reducer;
