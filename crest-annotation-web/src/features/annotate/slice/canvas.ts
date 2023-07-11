import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../../app/store";
import { Transformation } from "../../../types/Transformation";
import { Translation } from "../../../types/Translation";

export const defaultTransformation = {
  translate: { x: 0.0, y: 0.0 },
  // uniform scaling
  scale: 1.0,
};

export interface CanvasSlice {
  transformation: Transformation;
}

const initialState: CanvasSlice = {
  transformation: defaultTransformation,
};

export const slice = createSlice({
  name: "canvas",
  initialState,
  reducers: {
    updateTranslation: (state, action: PayloadAction<Translation>) => {
      state.transformation.translate = action.payload;
    },
    updateScale: (state, action: PayloadAction<number>) => {
      state.transformation.scale = action.payload;
    },
    updateTransformation: (state, action: PayloadAction<Transformation>) => {
      state.transformation = action.payload;
    },
  },
});

export const { updateTransformation } = slice.actions;

export const selectTransformation = (state: RootState) =>
  state.canvas.transformation;

export default slice.reducer;
