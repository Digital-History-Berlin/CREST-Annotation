import { AnyAction, createSlice, Middleware } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { Circle } from "./tools/circle";
import { Line } from "./tools/line";
import { Rectangle } from "./tools/rectangle";
import { Polygon } from "./tools/polygon";
import { Label } from "../../api/openApi";
import { enhancedApi } from "../../api/enhancedApi";

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
  label?: Label;
  shape?: Shape;

  // default to false
  selected?: boolean;
  hidden?: boolean;
  locked?: boolean;
}

export interface InspectionSlice {
  objectId: string | null;
  activeTool: Tool;
  activeLabel?: Label;
  annotations: Annotation[];
  latestChange: number | null;
}

const initialState: InspectionSlice = {
  objectId: null,
  activeTool: Tool.Pen,
  activeLabel: undefined,
  annotations: [],
  latestChange: null,
};

const replaceAnnotation = (state: InspectionSlice, annotation: Annotation) =>
  state.annotations.map((a) => (a.id === annotation.id ? annotation : a));

const isAnnotationMutation = (action: AnyAction) =>
  [
    "inspection/addAnnotation",
    "inspection/updateAnnotation",
    "inspection/deleteAnnotation",
    "inspection/lockAnnotation",
    "inspection/unlockAnnotation",
    "inspection/hideAnnotation",
    "inspection/showAnnotation",
  ].includes(action.type);

const isObjectChange = (action: AnyAction) =>
  ["inspection/setObjectId"].includes(action.type);

export const slice = createSlice({
  name: "inspection",
  initialState,
  reducers: {
    setObjectId: (state, action) => {
      state.objectId = action.payload;
      // clear local annotations
      state.annotations = [];
    },
    setActiveTool: (state, action) => {
      state.activeTool = action.payload;
    },
    setActiveLabel: (state, action) => {
      state.activeLabel = action.payload;
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
  extraReducers: (builder) => {
    builder.addMatcher(isAnnotationMutation, (state, action) => {
      state.latestChange = Date.now();
    });
    builder.addMatcher(
      enhancedApi.endpoints.getAnnotations.matchFulfilled,
      (state, action) => {
        try {
          state.annotations = JSON.parse(action.payload);
        } catch (e) {
          // TODO: error handling
        }
      }
    );
  },
});

export const {
  setObjectId,
  setActiveTool,
  setActiveLabel,
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

export const selectObjectId = (state: RootState) => state.annotate.objectId;
export const selectActiveTool = (state: RootState) => state.annotate.activeTool;
export const selectActiveLabel = (state: RootState) =>
  state.annotate.activeLabel;
export const selectAnnotations = (state: RootState) =>
  state.annotate.annotations;

export default slice.reducer;

export const annotateMiddleware: Middleware<{}, RootState> =
  (store) => (next) => (action) => {
    next(action);

    const state = store.getState().annotate;

    // track and forward all modifications to the backend
    if (isAnnotationMutation(action) && state.objectId) {
      store.dispatch(
        // @ts-expect-error maybe incorrect types in redux
        enhancedApi.endpoints.storeAnnotations.initiate({
          objectId: state.objectId,
          body: JSON.stringify(state.annotations),
        })
      );
    }

    // pull notifications from the backend
    if (isObjectChange(action) && state.objectId) {
      store.dispatch(
        // @ts-expect-error maybe incorrect types in redux
        enhancedApi.endpoints.getAnnotations.initiate({
          objectId: state.objectId,
        })
      );
    }
  };
