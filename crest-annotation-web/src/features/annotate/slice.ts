import {
  AnyAction,
  Middleware,
  PayloadAction,
  createSlice,
} from "@reduxjs/toolkit";
import { Circle } from "./tools/circle";
import { Line } from "./tools/line";
import { Polygon } from "./tools/polygon";
import { Rectangle } from "./tools/rectangle";
import { enhancedApi } from "../../api/enhancedApi";
import { Label } from "../../api/openApi";
import { RootState } from "../../app/store";

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

export interface Transformation {
  scale: number;
  translate: { x: number; y: number };
}

export const defaultTransformation = {
  translate: { x: 0.0, y: 0.0 },
  // uniform scaling
  scale: 1.0,
};

export interface InspectionSlice {
  objectId: string | null;
  // active tools for annotation process
  activeTool: Tool;
  activeModifiers: Modifiers[];
  activeLabel?: Label;
  activeAnnotation?: Annotation;
  // annotation data
  annotations: Annotation[];
  latestChange: number | null;
  // canvas state
  transformation: Transformation;
}

const initialState: InspectionSlice = {
  objectId: null,
  activeTool: Tool.Pen,
  activeLabel: undefined,
  activeModifiers: [],
  annotations: [],
  latestChange: null,
  transformation: defaultTransformation,
};

const except = <T>(items: T[], item: T) => items.filter((i) => i !== item);

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
    setObjectId: (state, action: PayloadAction<string | null>) => {
      state.objectId = action.payload;
    },
    setActiveTool: (state, action: PayloadAction<Tool>) => {
      state.activeTool = action.payload;
    },
    setActiveLabel: (state, action: PayloadAction<Label | undefined>) => {
      state.activeLabel = action.payload;
    },
    setActiveAnnotation: (
      state,
      action: PayloadAction<Annotation | undefined>
    ) => {
      state.activeAnnotation = action.payload;
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
    addAnnotation: (state, action: PayloadAction<Annotation>) => {
      state.annotations.push({
        ...action.payload,
        position: state.annotations.length,
      });
      // added annotation becomes active
      state.activeAnnotation = action.payload;
    },
    updateAnnotation: (state, action: PayloadAction<Annotation>) => {
      state.annotations = replaceAnnotation(state, action.payload);
    },
    updateActiveAnnotation: (state, action: PayloadAction<Annotation>) => {
      state.activeAnnotation = action.payload;
    },
    updateShape: (
      state,
      {
        payload: { annotation, shape, index },
      }: PayloadAction<{
        annotation: Annotation;
        shape: Shape;
        index: number;
      }>
    ) => {
      if (annotation.shapes)
        state.annotations = replaceAnnotation(state, {
          ...annotation,
          // replace the shape at the given index
          shapes: [
            ...annotation.shapes.slice(0, index),
            shape,
            ...annotation.shapes.slice(index + 1),
          ],
        });
    },
    deleteAnnotation: (state, action: PayloadAction<Annotation>) => {
      state.annotations = state.annotations.filter(
        (a) => a.id !== action.payload.id
      );
      // check if active annotation was deleted
      if (state.activeAnnotation?.id === action.payload.id)
        state.activeAnnotation = undefined;
    },
    selectAnnotation: (state, action: PayloadAction<Annotation>) => {
      state.annotations = state.annotations.map((a) => ({
        ...a,
        selected: a.id === action.payload.id,
      }));
    },
    unselectAnnotation: (state) => {
      state.annotations = state.annotations.map((a) => ({
        ...a,
        selected: false,
      }));
    },
    lockAnnotation: (state, action: PayloadAction<Annotation>) => {
      state.annotations = replaceAnnotation(state, {
        ...action.payload,
        locked: true,
        selected: false,
      });
    },
    unlockAnnotation: (state, action: PayloadAction<Annotation>) => {
      state.annotations = replaceAnnotation(state, {
        ...action.payload,
        locked: false,
      });
    },
    hideAnnotation: (state, action: PayloadAction<Annotation>) => {
      state.annotations = replaceAnnotation(state, {
        ...action.payload,
        hidden: true,
        selected: false,
      });
    },
    showAnnotation: (state, action: PayloadAction<Annotation>) => {
      state.annotations = replaceAnnotation(state, {
        ...action.payload,
        hidden: false,
      });
    },
    updateTransformation: (state, action: PayloadAction<Transformation>) => {
      state.transformation = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(isAnnotationMutation, (state) => {
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
  updateShape,
  deleteAnnotation,
  selectAnnotation,
  unselectAnnotation,
  lockAnnotation,
  unlockAnnotation,
  hideAnnotation,
  showAnnotation,
  updateActiveAnnotation,
  setModifiers,
  setModifier,
  toggleModifier,
  updateTransformation,
} = slice.actions;

export const selectObjectId = (state: RootState) => state.annotate.objectId;
export const selectActiveTool = (state: RootState) => state.annotate.activeTool;
export const selectActiveLabel = (state: RootState) =>
  state.annotate.activeLabel;
export const selectActiveAnnotation = (state: RootState) =>
  state.annotate.activeAnnotation;
export const selectActiveModifiers = (state: RootState) =>
  state.annotate.activeModifiers;
export const selectAnnotations = (state: RootState) =>
  state.annotate.annotations;
export const selectTransformation = (state: RootState) =>
  state.annotate.transformation;

export default slice.reducer;

export const annotateMiddleware: Middleware<void, RootState> =
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
        enhancedApi.endpoints.getAnnotations.initiate(
          { objectId: state.objectId },
          // always re-fetch data if object is changed
          { subscribe: false, forceRefetch: true }
        )
      );
    }
  };
