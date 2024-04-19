import {
  Action,
  Middleware,
  PayloadAction,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import { enhancedApi } from "../../../api/enhancedApi";
import { Object as DataObject, Label, Project } from "../../../api/openApi";
import { useAppSelector } from "../../../app/hooks";
import { RootState } from "../../../app/store";
import { Shape } from "../types/shapes";

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
  // existing annotation that is being edited
  editing: Annotation | null;
  // required for middleware
  project: Project | null;
  object: DataObject | null;
  image: string | null;
}

const initialState: AnnotationsSlice = {
  annotations: [],
  latestChange: null,
  editing: null,
  project: null,
  object: null,
  image: null,
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
export const isServerMutation = (action: Action) =>
  [
    "annotations/addAnnotation",
    "annotations/addShape",
    "annotations/updateShape",
    "annotations/doneEditAnnotation",
    "annotations/updateAnnotation",
    "annotations/deleteAnnotation",
    "annotations/lockAnnotation",
    "annotations/unlockAnnotation",
    "annotations/hideAnnotation",
    "annotations/showAnnotation",
  ].includes(action.type);

// actions that change the object or project
export const isObjectChange = (action: Action) =>
  ["annotations/updateObject"].includes(action.type);

/**
 * Contains the created annotations for the current object
 *
 * Provides a middleware which whill automatically synchronize
 * annotations with the backend. For this to work, the current
 * project/object needs to be known.
 */
export const slice = createSlice({
  name: "annotations",
  initialState,
  reducers: {
    updateObject: (
      state,
      action: PayloadAction<{
        object: DataObject;
        project: Project;
        image: string;
      } | null>
    ) => {
      state.object = action.payload?.object || null;
      state.project = action.payload?.project || null;
      state.image = action.payload?.image || null;
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
    startEditAnnotation: (state, action: PayloadAction<Annotation>) => {
      // start editing annotation (show dialog)
      state.editing = action.payload;
    },
    cancelEditAnnotation: (state) => {
      // cancel editing annotation (hide dialog)
      state.editing = null;
    },
    doneEditAnnotation: (state, action: PayloadAction<Label>) => {
      if (state.editing)
        // update the label of the editing annotation
        state.annotations = replaceAnnotation(state, state.editing.id, {
          label: action.payload,
        });
      state.editing = null;
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
  updateObject,
  updateAnnotations,
  addAnnotation,
  addShape,
  updateShape,
  startEditAnnotation,
  cancelEditAnnotation,
  doneEditAnnotation,
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

export const useAnnotationProject = (): Project =>
  // safe to use from within annotation components
  // (index blocks rendering if not set)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  useAppSelector((state) => state.annotations.project!);
export const useAnnotationObject = (): DataObject =>
  // safe to use from within annotation components
  // (index blocks rendering if not set)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  useAppSelector((state) => state.annotations.object!);
export const useAnnotationImage = (): string =>
  // safe to use from within annotation components
  // (index blocks rendering if not set)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  useAppSelector((state) => state.annotations.image!);

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

const pullAnnotations = createAsyncThunk(
  "annotations/pullAnnotations",
  async (
    { objectId, projectId }: { objectId: string; projectId: string },
    { dispatch }
  ) => {
    // re-fetch the annotations
    const json = await dispatch(
      enhancedApi.endpoints.getAnnotations.initiate(
        { objectId: objectId },
        { forceRefetch: true }
      )
    ).unwrap();
    // request the labels for hydration
    const labels = await dispatch(
      enhancedApi.endpoints.getProjectLabels.initiate({
        projectId: projectId,
      })
    ).unwrap();
    // map labels to their identifiers
    const lookup = Object.fromEntries(labels.map((label) => [label.id, label]));
    // hydrate the annotations
    const annotations: Annotation[] = JSON.parse(json).map(
      (annotation: Annotation) => ({
        ...annotation,
        label: annotation.label && lookup[annotation.label.id],
      })
    );
    // update the store
    dispatch(updateAnnotations(annotations));
  }
);

// automatically push and pull annotations
// eslint-disable-next-line @typescript-eslint/ban-types
export const annotateMiddleware: Middleware<{}, RootState> =
  (store) => (next) => (action) => {
    next(action);

    if (!action || typeof action !== "object" || !("type" in action))
      // ignore unexpected actions
      return;

    const state = store.getState();
    // track and push modifications to the backend
    if (isServerMutation(action as Action) && state.annotations.object)
      store.dispatch(
        // @ts-expect-error circular dependency
        enhancedApi.endpoints.storeAnnotations.initiate({
          objectId: state.annotations.object.id,
          body: toJson(state.annotations.annotations),
        })
      );

    // pull notifications from the backend
    if (isObjectChange(action as Action)) {
      const { payload } = action as PayloadAction<{
        object: DataObject;
        project: Project;
      } | null>;

      if (payload?.project && payload.object)
        store.dispatch(
          // @ts-expect-error circular dependency
          pullAnnotations({
            projectId: payload.project.id,
            objectId: payload.object.id,
          })
        );
    }
  };
