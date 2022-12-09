import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { Circle } from "./tools/circle";
import { Line } from "./tools/line";
import { Rectangle } from "./tools/rectangle";
import { Polygon } from "./tools/polygon";

export enum Tool {
  Pen,
  Circle,
  Rectangle,
  Polygon,
}

/// Combines all available shape types with meta fields
export type Shape = (Rectangle | Circle | Line | Polygon) & { tool: Tool };

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
  state.annotations.map((a) => (a.id === annotation.id ? annotation : a));

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
      state.annotations = replaceAnnotation(state, action.payload);
    },
    deleteAnnotation: (state, action) => {
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
      state.annotations = replaceAnnotation(state, {
        ...action.payload,
        selected: false,
      });
    },
    lockAnnotation: (state, action) => {
      state.annotations = replaceAnnotation(state, {
        ...action.payload,
        locked: true,
        selected: false,
      });
    },
    unlockAnnotation: (state, action) => {
      state.annotations = replaceAnnotation(state, {
        ...action.payload,
        locked: false,
      });
    },
    hideAnnotation: (state, action) => {
      state.annotations = replaceAnnotation(state, {
        ...action.payload,
        hidden: true,
        selected: false,
      });
    },
    showAnnotation: (state, action) => {
      state.annotations = replaceAnnotation(state, {
        ...action.payload,
        hidden: false,
      });
    },
  },
});

export const {
  setImageId,
  setActiveTool,
  addAnnotation,
  updateAnnotation,
  deleteAnnotation,
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
