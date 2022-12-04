import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { Circle } from "../tools/circle";
import { Line } from "../tools/line";
import { Rectangle } from "../tools/rectangle";

export enum Tool {
  Pen,
  Circle,
  Rectangle,
}

/// Combines all available shape types with meta fields
export type Shape = (Rectangle | Circle | Line) & { tool: Tool };

export interface Annotation {
  id: string;
  label?: string;
  shape?: Shape;
}

export interface InspectionSlice {
  imageId: string | null;
  activeTool: Tool;
  annotations: Annotation[];
}

const initialState: InspectionSlice = {
  imageId: null,
  activeTool: Tool.Pen,
  annotations: [],
};

export const slice = createSlice({
  name: "inspection",
  initialState,
  reducers: {
    setImageId: (state, action) => {
      state.imageId = action.payload;
    },
    setActiveTool: (state, action) => {
      state.activeTool = action.payload;
    },
    addAnnotation: (state, action) => {
      state.annotations.push(action.payload);
    },
    removeAnnotation: (state, action) => {
      state.annotations = state.annotations.filter(
        (a) => a.id !== action.payload.id
      );
    },
  },
  extraReducers: (builder) => {},
});

export const { setImageId, setActiveTool, addAnnotation, removeAnnotation } =
  slice.actions;

export const selectImageId = (state: RootState) => state.annotate.imageId;
export const selectActiveTool = (state: RootState) => state.annotate.activeTool;
export const selectAnnotations = (state: RootState) =>
  state.annotate.annotations;

export default slice.reducer;
