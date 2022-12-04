import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { enhancedApi } from "../api/enhancedApi";
import annotateReducer from "../features/annotate/slice";
import counterReducer from "../features/counter/counterSlice";

export const store = configureStore({
  reducer: {
    annotate: annotateReducer,
    counter: counterReducer,
    [enhancedApi.reducerPath]: enhancedApi.reducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(enhancedApi.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
