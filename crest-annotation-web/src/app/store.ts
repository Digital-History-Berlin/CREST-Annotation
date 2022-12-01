import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import annotateReducer from "../features/annotate/slice";
import counterReducer from "../features/counter/counterSlice";

export const store = configureStore({
  reducer: {
    annotate: annotateReducer,
    counter: counterReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
