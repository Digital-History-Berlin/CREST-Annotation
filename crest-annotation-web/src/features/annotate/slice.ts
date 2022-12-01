import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

export enum Tool {
  Pen,
  Circle,
  Rectangle,
}

export interface Annotation {
  uuid: string;
  label: string;
  shape: any; // TODO: define shape structure as required by canvas
}

export interface InspectionSlice {
  activeTool: Tool;
  annotations: Annotation[];
}

const initialState: InspectionSlice = {
  activeTool: Tool.Pen,
  annotations: [],
};

export const slice = createSlice({
  name: "inspection",
  initialState,
  reducers: {
    setActiveTool: (state, action) => {
      state.activeTool = action.payload;
    },
    addAnnotation: (state, action) => {
      state.annotations.push(action.payload);
    },
    removeAnnotation: (state, action) => {
      state.annotations = state.annotations.filter(
        (a) => a.uuid !== action.payload.uuid
      );
    },
  },
  extraReducers: (builder) => {},
});

export const { setActiveTool } = slice.actions;

export const selectActiveTool = (state: RootState) => state.annotate.activeTool;
export const selectAnnotations = (state: RootState) =>
  state.annotate.annotations;

export default slice.reducer;
