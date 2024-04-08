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

export interface Operation<T extends string, S> {
  readonly id: string;
  readonly type: T;
  // operation meta data
  name?: string;
  progress?: number;
  // user state data
  state: S;
  // callbacks for cleanup
  cancellation?: OperationCancellation;
  finalization?: OperationFinalization;
}
