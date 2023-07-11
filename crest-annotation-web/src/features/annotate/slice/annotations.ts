import {
  AnyAction,
  Middleware,
  PayloadAction,
  createSlice,
} from "@reduxjs/toolkit";
import { Tool } from "./tools";
import { enhancedApi } from "../../../api/enhancedApi";
import { Label } from "../../../api/openApi";
import { RootState } from "../../../app/store";
import { pullAnnotations } from "../epics";
import { Circle } from "../tools/circle";
import { Line } from "../tools/line";
import { Polygon } from "../tools/polygon";
import { Rectangle } from "../tools/rectangle";

/// Combines all available shape types with meta fields
export type Shape = (Rectangle | Circle | Line | Polygon) & { tool: Tool };

export interface Annotation {
  id: string;
  position?: number;
  label?: Label;
  shapes?: Shape[];

  // default to false
  selected?: boolean;
  hidden?: boolean;
  locked?: boolean;
}

export interface AnnotationsSlice {
  annotations: Annotation[];
  latestChange: number | null;
  editing: Annotation | null;
  // required for middleware
  objectId: string | null;
  projectId: string | null;
}

const initialState: AnnotationsSlice = {
  annotations: [],
  latestChange: null,
  editing: null,
  objectId: null,
  projectId: null,
};

const replaceAnnotation = (
  state: AnnotationsSlice,
  id: string,
  patch: Partial<Annotation>
) =>
  state.annotations.map((annotation) =>
    annotation.id === id ? { ...annotation, ...patch } : annotation
  );

// actions that will trigger the annotations middleware,
// which will update the annotations on the server side
const isServerMutation = (action: AnyAction) =>
  [
    "annotations/addAnnotation",
    "annotations/addShape",
    "annotations/updateShape",
    "annotations/updateAnnotation",
    "annotations/deleteAnnotation",
    "annotations/lockAnnotation",
    "annotations/unlockAnnotation",
    "annotations/hideAnnotation",
    "annotations/showAnnotation",
  ].includes(action.type);

// actions that change the object or project
const isObjectChange = (action: AnyAction) =>
  ["annotations/setObjectId"].includes(action.type);

export const slice = createSlice({
  name: "annotations",
  initialState,
  reducers: {
    setObjectId: (
      state,
      action: PayloadAction<{ objectId: string; projectId: string } | null>
    ) => {
      state.objectId = action.payload?.objectId || null;
      state.projectId = action.payload?.projectId || null;
    },
    updateAnnotations: (state, action: PayloadAction<Annotation[]>) => {
      state.annotations = action.payload;
    },
    addAnnotation: (state, action: PayloadAction<Annotation>) => {
      state.annotations.push({
        ...action.payload,
        position: state.annotations.length,
      });
    },
    addShape: (
      state,
      { payload: { id, shape } }: PayloadAction<{ id: string; shape: Shape }>
    ) => {
      state.annotations = state.annotations.map((annotation) =>
        annotation.id === id
          ? {
              ...annotation,
              shapes: [...(annotation.shapes || []), shape],
            }
          : annotation
      );
    },
    updateShape: (
      state,
      {
        payload: { id, shape, index },
      }: PayloadAction<{ id: string; shape: Shape; index: number }>
    ) => {
      state.annotations = state.annotations.map((annotation) =>
        annotation.id === id && annotation.shapes
          ? {
              ...annotation,
              // replace the shape at the given index
              shapes: [
                ...annotation.shapes.slice(0, index),
                shape,
                ...annotation.shapes.slice(index + 1),
              ],
            }
          : annotation
      );
    },
    editAnnotation: (state, action: PayloadAction<Annotation | null>) => {
      // start editing annotation (show dialog)
      state.editing = action.payload;
    },
    updateAnnotation: (state, action: PayloadAction<Annotation>) => {
      state.annotations = state.annotations.map((annotation) =>
        annotation.id === action.payload.id ? action.payload : annotation
      );
    },
    deleteAnnotation: (state, action: PayloadAction<{ id: string }>) => {
      state.annotations = state.annotations.filter(
        (annotation) => annotation.id !== action.payload.id
      );
    },
    selectAnnotation: (state, action: PayloadAction<{ id: string }>) => {
      state.annotations = state.annotations.map((annotation) => ({
        ...annotation,
        selected: annotation.id === action.payload.id,
      }));
    },
    unselectAnnotation: (state) => {
      state.annotations = state.annotations.map((annotation) => ({
        ...annotation,
        selected: false,
      }));
    },
    toggleAnnotation: (state, action: PayloadAction<{ id: string }>) => {
      console.log(action.payload);
      state.annotations = state.annotations.map((annotation) => ({
        ...annotation,
        selected: !annotation.selected && annotation.id === action.payload.id,
      }));
    },
    lockAnnotation: (state, action: PayloadAction<{ id: string }>) => {
      state.annotations = replaceAnnotation(state, action.payload.id, {
        locked: true,
        selected: false,
      });
    },
    unlockAnnotation: (state, action: PayloadAction<{ id: string }>) => {
      state.annotations = replaceAnnotation(state, action.payload.id, {
        locked: false,
      });
    },
    hideAnnotation: (state, action: PayloadAction<{ id: string }>) => {
      state.annotations = replaceAnnotation(state, action.payload.id, {
        hidden: true,
        selected: false,
      });
    },
    showAnnotation: (state, action: PayloadAction<{ id: string }>) => {
      state.annotations = replaceAnnotation(state, action.payload.id, {
        hidden: false,
      });
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(isServerMutation, (state) => {
      state.latestChange = Date.now();
    });
  },
});

export const {
  setObjectId,
  updateAnnotations,
  addAnnotation,
  addShape,
  updateShape,
  editAnnotation,
  updateAnnotation,
  deleteAnnotation,
  selectAnnotation,
  unselectAnnotation,
  toggleAnnotation,
  lockAnnotation,
  unlockAnnotation,
  hideAnnotation,
  showAnnotation,
} = slice.actions;

export const selectObjectId = (state: RootState) => state.annotations.objectId;
export const selectEditing = (state: RootState) => state.annotations.editing;
export const selectAnnotations = (state: RootState) =>
  state.annotations.annotations;

export default slice.reducer;

const toJson = (annotations: Annotation[]): string => {
  // strip obsolete data
  return JSON.stringify(
    annotations.map((annotation) => ({
      ...annotation,
      label: annotation.label && { id: annotation.label.id },
    }))
  );
};

// automatically push and pull annotations
export const annotateMiddleware: Middleware<void, RootState> =
  (store) => (next) => (action) => {
    next(action);

    const state = store.getState();

    // track and push modifications to the backend
    if (isServerMutation(action) && state.annotations.objectId)
      store.dispatch(
        // @ts-expect-error dispatch has incorrect type
        enhancedApi.endpoints.storeAnnotations.initiate({
          objectId: state.annotations.objectId,
          body: toJson(state.annotations.annotations),
        })
      );

    // pull notifications from the backend
    if (
      isObjectChange(action) &&
      action.payload.objectId &&
      action.payload.projectId
    )
      // @ts-expect-error dispatch has incorrect type
      store.dispatch(pullAnnotations(action.payload));
  };
