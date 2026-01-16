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
import { createAppAsyncThunk } from "../../../types/thunks";
import { Shape } from "../types/shapes";

export interface InlineLabel {
  name: string;
  color?: string;
  reference?: string;
}

export interface Annotation {
  id: string;
  position?: number;
  label?: Label;
  inlineLabel?: InlineLabel;
  shapes?: Shape[];

  // default to false
  selected?: boolean;
  hidden?: boolean;
  locked?: boolean;
  // true if annotation comes from external source
  external?: boolean;
  // true if annotation has been modified locally
  dirty?: boolean;
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
  session: string | null;
}

const initialState: AnnotationsSlice = {
  annotations: [],
  latestChange: null,
  editing: null,
  project: null,
  object: null,
  image: null,
  session: null,
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
        session: string;
      } | null>
    ) => {
      state.object = action.payload?.object || null;
      state.project = action.payload?.project || null;
      state.image = action.payload?.image || null;
      state.session = action.payload?.session || null;
    },
    updateAnnotations: (state, action: PayloadAction<Annotation[]>) => {
      state.annotations = action.payload;
    },
    addAnnotation: (state, action: PayloadAction<Annotation>) => {
      state.annotations.push({
        ...action.payload,
        position: state.annotations.length,
        dirty: true,
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
              dirty: true,
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
              dirty: true,
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
          dirty: true,
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
    clearDirty: (state) => {
      state.annotations = state.annotations.map((annotation) => ({
        ...annotation,
        dirty: false,
      }));
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
  clearDirty,
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
export const useAnnotationSession = (): string =>
  // safe to use from within annotation components
  // (index blocks rendering if not set)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  useAppSelector((state) => state.annotations.session!);

export const selectAnnotations = (state: RootState) =>
  state.annotations.annotations;
export const selectExternal = (state: RootState) =>
  !!state.annotations.project?.sync_type;
export const selectChangesCount = (state: RootState) =>
  state.annotations.annotations.filter(({ dirty }) => !!dirty).length;

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

const normalize = <T extends object>(entries: T[], key: keyof T) =>
  Object.fromEntries(
    entries.map((entry) => [entry[key], entry]).filter(([key]) => !!key)
  );

const pullAnnotations = createAsyncThunk(
  "annotations/pullAnnotations",
  async (
    { project, objectId }: { project: Project; objectId: string },
    { dispatch }
  ) => {
    // pull from default backend source
    const json = await dispatch(
      enhancedApi.endpoints.getAnnotations.initiate(
        { objectId: objectId },
        { forceRefetch: true }
      )
    ).unwrap();

    const annotations = JSON.parse(json);
    if (!project?.sync_type) return annotations;

    // merge with external source if configured
    console.info(`Pulling annotations from ${project.sync_type} backend`);

    const external = await dispatch(
      enhancedApi.endpoints.pullAnnotations.initiate({ objectId })
    ).unwrap();

    // merge with external-wins strategy
    return Object.values({
      ...normalize(annotations, "id"),
      ...normalize(external, "id"),
    });
  }
);

const resolveLabels = createAppAsyncThunk(
  "annotations/resolveLabels",
  async (
    { project, annotations }: { project: Project; annotations: Annotation[] },
    { dispatch }
  ) => {
    // request the labels for hydration
    const labels = await dispatch(
      enhancedApi.endpoints.getProjectLabels.initiate({
        projectId: project.id,
      })
    ).unwrap();

    const ids = normalize(labels, "id");
    const references = normalize(labels, "reference");
    console.log(annotations, references);

    const resolve = (label?: Partial<Label>) =>
      (label?.id && ids[label.id]) ||
      (label?.reference && references[label.reference]);

    return annotations.map((annotation) => ({
      ...annotation,
      // hydrate label from project labels
      // (preserve inlineLabel as fallback)
      label: resolve(annotation.label),
      inlineLabel: annotation.inlineLabel,
    }));
  }
);

const resolveAnnotations = createAppAsyncThunk(
  "annotations/pullAnnotations",
  async ({ objectId }: { objectId: string }, { dispatch, getState }) => {
    const state = getState() as RootState;
    const project = state.annotations.project;
    if (!project) return;

    // re-fetch object lock
    dispatch(enhancedApi.util.invalidateTags(["Lock"]));

    // fetch and hydrate annotations
    const annotations = await dispatch(
      pullAnnotations({ project, objectId })
    ).unwrap();
    const resolved = await dispatch(
      resolveLabels({ project, annotations })
    ).unwrap();

    // update the store
    dispatch(updateAnnotations(resolved));
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

    const { annotations, project, object, session } =
      store.getState().annotations;

    // track and push modifications to the backend
    if (isServerMutation(action as Action) && project && object && session)
      // @ts-expect-error circular dependency
      store
        .dispatch(
          // @ts-expect-error circular dependency
          enhancedApi.endpoints.storeAnnotations.initiate({
            objectId: object.id,
            sessionId: session,
            body: toJson(annotations),
          })
        )
        .unwrap()
        // recover from failed requests
        .catch(() => {
          store.dispatch(
            // @ts-expect-error circular dependency
            resolveAnnotations({
              objectId: object.id,
            })
          );
        });

    // pull notifications from the backend
    if (isObjectChange(action as Action)) {
      const { payload } = action as PayloadAction<{
        object: DataObject;
        project: Project;
      } | null>;

      if (payload?.project && payload.object)
        store.dispatch(
          // @ts-expect-error circular dependency
          resolveAnnotations({
            objectId: payload.object.id,
          })
        );
    }
  };
