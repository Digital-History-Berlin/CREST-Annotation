import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { isObjectChange } from "./annotations";
import { RootState } from "../../../app/store";
import { Transformation } from "../../../types/geometry";

export const defaultTransformation = {
  translate: { x: 0.0, y: 0.0 },
  // uniform scaling
  scale: 1.0,
};

export interface CanvasSlice {
  transformation: Transformation;
  initialized: boolean;
}

const initialState: CanvasSlice = {
  transformation: defaultTransformation,
  initialized: false,
};

const validate = (x: number, fallback = 0.0) => (isFinite(x) ? x : fallback);

export const slice = createSlice({
  name: "canvas",
  initialState,
  reducers: {
    updateTransformation: (state, action: PayloadAction<Transformation>) => {
      state.transformation = {
        scale: validate(action.payload.scale, 1.0),
        translate: {
          x: validate(action.payload.translate.x),
          y: validate(action.payload.translate.y),
        },
      };

      state.initialized = true;
    },
  },
  extraReducers: (builder) => {
    // reset the transformation on change to avoid flickering
    builder.addMatcher(isObjectChange, (state) => {
      state.initialized = false;
    });
  },
});

export const { updateTransformation } = slice.actions;

export const selectTransformation = (state: RootState) =>
  state.canvas.transformation;
export const selectInitialized = (state: RootState) => state.canvas.initialized;

export default slice.reducer;
