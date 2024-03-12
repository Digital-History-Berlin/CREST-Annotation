import { useCallback, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { MaybePromise } from "../../../types/MaybePromise";

export type InvokeActionCallback<T> = () => MaybePromise<T>;

export type BeginActionCallback<T> = (
  resolve: (result: T) => void,
  reject: (reason: unknown) => void
) => MaybePromise<T>;

export type ChainedActionCallback<T> = (
  result: T,
  resolve: (result: T) => void,
  reject: (reason: unknown) => void
) => MaybePromise<T>;

export type InvokeActionParams<T> = {
  resolved?: (result: T) => void;
  rejected?: (reason: unknown) => void;
  discarded?: () => void;
  finalized?: () => void;
  cancel?: (reason: string) => void;
};

export interface ActionStream {
  isActive: (token: string) => boolean;
  invoke: <T>(
    callback: InvokeActionCallback<T>,
    params: InvokeActionParams<T>
  ) => string;
  begin: <T>(
    callback: BeginActionCallback<T>,
    params: InvokeActionParams<T>
  ) => ChainedAction<T>;
  cancel: (token: string) => void;
}

const notInitialized = () => {
  throw new Error("Not initialized");
};

/**
 * Helper class that allows chaining promises within a single action
 */
export class ChainedAction<T> {
  private _identifier = uuidv4();
  // the promise that is returned to the caller
  private _awaitable: Promise<T>;
  // references to the promise callbacks
  private _resolve: (result: T) => void = notInitialized;
  private _reject: (reason: unknown) => void = notInitialized;
  // the latest promise that was chained
  private _latest?: Promise<T>;

  public constructor(callback: BeginActionCallback<T>) {
    this._awaitable = new Promise<T>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
    // initial call without previous value
    this._latest = Promise.resolve(
      callback(
        (result: T) => this.resolve(result),
        (reason: unknown) => this.reject(reason)
      )
    );
  }

  public chain(callback: ChainedActionCallback<T>): void {
    // chain the callback to the latest promise
    this._latest = this._latest?.then((result) =>
      callback(
        result,
        (result: T) => this.resolve(result),
        (reason: unknown) => this.reject(reason)
      )
    );
  }

  public awaitable(): Promise<T> {
    return this._awaitable;
  }

  public resolve(result: T) {
    console.info(`Chained action ${this._identifier} resolved`);
    // mark internally as resolved
    this._latest = undefined;
    // mark externally as resolved
    this._resolve(result);
  }

  public reject(reason: unknown) {
    console.info(`Chained action ${this._identifier} rejected`);
    // mark internally as rejected
    this._latest = undefined;
    // mark externally as rejected
    this._reject(reason);
  }
}

/**
 * Provides a simple solutiont to keep track of user actions
 *
 * Because some of the user interaction is executed asynchronously,
 * it needs to be tracked to ensure the results are still relevant,
 * when they arrive.
 *
 * This approach discards every result, that arrives after the user
 * started another interaction.
 */
export const useActionStream = (): ActionStream => {
  // reference the current operation
  const op = useRef<string>();
  // reference to the current operations discard callback
  const cancellation = useRef<(reason: string) => void>();

  const isActive = useCallback((token: string) => op.current === token, []);

  const cancel = useCallback((token?: string) => {
    if (token ? op.current === token : op.current !== undefined) {
      // another operation was still ongoing and will be discarded on completion
      console.info(`Operation ${op.current} cancelled`);
      // request cancellation if possible
      cancellation.current?.("Operation cancelled");
    }
  }, []);

  const invoke = useCallback(
    <T>(callback: InvokeActionCallback<T>, params: InvokeActionParams<T>) => {
      const operationId = uuidv4();

      console.debug(`Operation ${operationId} invoked`);
      if (op.current !== undefined) cancel();

      // execute the operation in asynchronous context
      op.current = operationId;
      cancellation.current = params?.cancel;
      Promise.resolve(callback())
        .then((result) => {
          // operation completed in time
          if (op.current === operationId) {
            console.debug(`Operation ${operationId} completed`);
            params.resolved?.(result);
          }
          // operation did not complete in time
          else {
            console.debug(`Operation ${operationId} discarded`);
          }
        })
        .catch((error) => {
          // operation did not complete (cancellation)
          if (typeof error === "string") {
            console.debug(`Operation ${operationId} cancelled: ${error}`);
          }
          // operation did not completed (unexpected failure)
          else {
            console.error(`Operation ${operationId} failed`);
            params.rejected?.(error);
          }
        })
        .finally(() => {
          console.debug(`Operation ${operationId} finalized`);
          // reset operation if active
          if (op.current === operationId) {
            op.current = undefined;
            cancellation.current = undefined;
          }
          // custom cleanup if required
          if (params.finalized) {
            params.finalized();
          }
        });

      // return operation id (this can happen before completion)
      return operationId;
    },
    [cancel]
  );

  const begin = useCallback(
    <T>(callback: BeginActionCallback<T>, params: InvokeActionParams<T>) => {
      console.info("Beginning chained action");
      // create a promise that can be resolved on demand
      const action = new ChainedAction<T>(callback);
      // invoke the promise as a normal action
      invoke(() => action.awaitable(), params);
      // return a reference to the wrapped promise
      return action;
    },
    [invoke]
  );

  // invoke cancellation on unmount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => cancel, []);

  return { isActive, invoke, begin, cancel };
};
