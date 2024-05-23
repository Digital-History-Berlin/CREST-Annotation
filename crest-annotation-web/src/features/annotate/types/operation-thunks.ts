import { Operation } from "./operation";
import { AppDispatch } from "../../../app/store";
import { MaybePromise } from "../../../types/maybe-promise";
import { PartialAppThunkApi } from "../../../types/thunks";

export type OperationContextApi<O extends Operation> = {
  // thunk API overrides for the context operation
  dispatch: AppDispatch;
  getState: () => O;
  // dispatch on context operation
  cancel: () => Promise<void>;
  update: (operation: O) => Promise<void>;
  complete: () => Promise<void>;
  // partial operation updates
  apply: (callback: (operation: O) => O) => Promise<void>;
  progress: (name?: string, progress?: number) => Promise<void>;
  state: (operation: O["state"]) => Promise<void>;
};

export type OperationContextOptions<O extends Operation> = {
  thunkApi: PartialAppThunkApi;
  // expected operation
  type?: O["type"];
  prefix?: string;
  // operation lifecycle options
  cancelOnError?: boolean;
  throwOnError?: boolean;
  autoComplete?: boolean;
};

export type OperationContextCallback<O extends Operation> = (
  contextApi: OperationContextApi<O>
) => MaybePromise<void>;

export type OperationContextFallback = () => MaybePromise<void>;
