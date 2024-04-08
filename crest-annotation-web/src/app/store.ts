import {
  Action,
  ThunkAction,
  combineReducers,
  configureStore,
} from "@reduxjs/toolkit";
import globalReducer from "./slice";
import { enhancedApi } from "../api/enhancedApi";
import annotationsReducer, {
  annotateMiddleware,
} from "../features/annotate/slice/annotations";
import canvasReducer from "../features/annotate/slice/canvas";
import operationReducer from "../features/annotate/slice/operation";
import toolboxReducer from "../features/annotate/slice/toolbox";

const rootReducer = combineReducers({
  global: globalReducer,
  annotations: annotationsReducer,
  canvas: canvasReducer,
  operation: operationReducer,
  toolbox: toolboxReducer,
  [enhancedApi.reducerPath]: enhancedApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(enhancedApi.middleware, annotateMiddleware),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
