import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
export type OperationFinalization = () => void;

export interface Operation {
  id: string;
  name?: string;
  progress?: number;

  // callbacks for cleanup
  cancellation?: OperationCancellation;
  finalization?: OperationFinalization;
}

export interface OperationController<T> {
  /// The active operation
  operation: Operation | undefined;
  /// The current operation state
  state: T;

  /// Begin a new operation
  begin: (state: T, options?: Omit<Operation, "id">) => void;
  /// Update the given operation
  update: (state: T, operation: Operation | undefined) => void;
  /// Complete the given operation
  complete: (operation: Operation | undefined) => void;
  /// Cancel the current operation
  cancel: () => void;
  /// Ensure the operation is still running
  assert: (operation: Operation | undefined) => void;
}

const debug = (message: string, operation: Operation) =>
  console.debug(`${message}: ${operation.id.substring(0, 6)}`);

/**
 * Provides a agnostic interface to manage long running operations
 *
 * This is essentially a state manager, which will ensure that only
 * the most recent operation can update the state. If an operation is
 * outdated, the controller will throw an error.
 *
 * Finalization will be called when an operation goes out of scope.
 */
export const useOperationController = <T>(
  initial: T
): OperationController<T> => {
  // the operation state is of arbitrary type
  const [state, setState] = useState<T>(initial);
  // reference to the current operation
  const op = useRef<Operation>();

  const assert = useCallback((operation: Operation | undefined): void => {
    if (operation === undefined || operation.id !== op.current?.id)
      throw new OperationRejectedError(operation?.id);
  }, []);

  const cancel = useCallback(() => {
    if (op.current === undefined) return;
    // trigger cancellation within current context
    op.current.cancellation?.();

    debug("Cancel operation", op.current);
    op.current = undefined;
    setState(initial);
  }, [initial]);

  const begin = useCallback(
    (state: T, options?: Omit<Operation, "id">) => {
      cancel();

      const operation = { ...options, id: uuidv4() };
      debug("Begin operation", operation);
      op.current = operation;
      setState(state);
    },
    [cancel]
  );

  const update = useCallback((state: T, operation: Operation | undefined) => {
    if (operation === undefined || operation.id !== op.current?.id)
      throw new OperationRejectedError(operation?.id);

    // avoid spamming console
    // debug("Update operation", operation);
    op.current = operation;
    setState(state);
  }, []);

  const complete = useCallback(
    (operation: Operation | undefined) => {
      if (operation === undefined || operation.id !== op.current?.id)
        throw new OperationRejectedError(operation?.id);

      debug("Complete operation", operation);
      op.current.finalization?.();
      op.current = undefined;
      setState(initial);
    },
    [initial]
  );

  // cancel the operation when the component is unmounted
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => cancel, []);

  return useMemo(
    () => ({
      operation: op.current,
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
