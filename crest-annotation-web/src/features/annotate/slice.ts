import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { Circle } from "./tools/circle";
import { Line } from "./tools/line";
import { Rectangle } from "./tools/rectangle";

export enum Tool {
  Pen,
  Circle,
  Rectangle,
}

/// Combines all available shape types with meta fields
export type Shape = (Rectangle | Circle | Line) & { tool: Tool };

export interface Annotation {
  id: string;
  position: number;
  label?: string;
  shape?: Shape;

  // default to false
  selected?: boolean;
  hidden?: boolean;
  locked?: boolean;
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

const replaceAnnotation = (state: InspectionSlice, annotation: Annotation) =>
  state.annotations.splice(annotation.position, 1, annotation);

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
      state.annotations.push({
        ...action.payload,
        position: state.annotations.length,
      });
    },
    updateAnnotation: (state, action) => {
      replaceAnnotation(state, action.payload);
    },
    removeAnnotation: (state, action) => {
      state.annotations = state.annotations.filter(
        (a) => a.id !== action.payload.id
      );
    },
    selectAnnotation: (state, action) => {
      state.annotations = state.annotations.map((a) => ({
        ...a,
        selected: a.id === action.payload.id,
      }));
    },
    unselectAnnotation: (state, action) => {
      replaceAnnotation(state, {
        ...action.payload,
        selected: false,
      });
    },
    lockAnnotation: (state, action) => {
      replaceAnnotation(state, {
        ...action.payload,
        locked: true,
        selected: false,
      });
    },
    unlockAnnotation: (state, action) => {
      replaceAnnotation(state, {
        ...action.payload,
        locked: false,
      });
    },
    hideAnnotation: (state, action) => {
      replaceAnnotation(state, {
        ...action.payload,
        hide: true,
        selected: false,
      });
    },
    showAnnotation: (state, action) => {
      replaceAnnotation(state, {
        ...action.payload,
        hide: true,
      });
    },
  },
  extraReducers: (builder) => {},
});

export const {
  setImageId,
  setActiveTool,
  addAnnotation,
  updateAnnotation,
  removeAnnotation,
  selectAnnotation,
  unselectAnnotation,
  lockAnnotation,
  unlockAnnotation,
  hideAnnotation,
  showAnnotation,
} = slice.actions;

export const selectImageId = (state: RootState) => state.annotate.imageId;
export const selectActiveTool = (state: RootState) => state.annotate.activeTool;
export const selectAnnotations = (state: RootState) =>
  state.annotate.annotations;

export default slice.reducer;
