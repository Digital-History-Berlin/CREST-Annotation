import { useCallback, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export class OperationRejectedError extends Error {
  constructor(operation: string | undefined) {
    super(
      operation === undefined
        ? "Unknown operation"
        : `Operation cancelled: ${operation}`
    );
  }
}

export type OperationCancellation = () => void;

export interface Operation {
  id: string;
  name?: string;
  progress?: number;
  cancellation?: OperationCancellation;
}

export interface OperationController<T extends Operation> {
  state?: T;
  // tools to manage the operation
  begin: (callback: (id: string) => T) => void;
  update: (operation: T) => void;
  complete: (operation: T) => void;
  cancel: () => void;
  assert: (operation: T) => void;
}

/**
 * Provides a agnostic interface to manage long running operations
 *
 * Updates that are outdated will throw an error.
 * Cancellation will be called when the operation goes out of scope.
 */
export const useOperationController = <
  T extends Operation
>(): OperationController<T> => {
  const [state, setState] = useState<T>();

  // begin a new operation (cancelling the previous one if it exists)
  const begin = useCallback(
    (callback: (id: string) => T) => {
      // trigger cancellation within current context
      if (state) state.cancellation?.();
      // overwrite the current operation
      setState(callback(uuidv4()));
    },
    [state]
  );

  // update the given operation
  const update = useCallback(
    (operation: T) => {
      if (operation.id !== state?.id)
        throw new OperationRejectedError(operation.id);
      // update the current operatio
      setState({ ...state, ...operation });
    },
    [state]
  );

  // complete the given operation
  const complete = useCallback(
    (operation: T) => {
      if (operation.id !== state?.id)
        throw new OperationRejectedError(operation.id);
      // clear the current operation
      setState(undefined);
    },
    [state]
  );

  // cancel the current operation
  const cancel = useCallback(() => {
    // trigger cancellation within current context
    if (state) state.cancellation?.();
    // clear the current operation
    setState(undefined);
  }, [state]);

  // assert that the operation is running
  const assert = useCallback(
    (operation: T) => {
      if (operation.id !== state?.id)
        throw new OperationRejectedError(operation.id);
    },
    [state]
  );

  // cancel the operation when the component is unmounted
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => cancel, []);

  return useMemo(
    () => ({
      state,
      begin,
      update,
      complete,
      cancel,
      assert,
    }),
    [state, begin, update, complete, cancel, assert]
  );
};
