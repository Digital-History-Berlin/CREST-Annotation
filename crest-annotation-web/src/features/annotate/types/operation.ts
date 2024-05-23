export class OperationTypeError extends Error {
  constructor({
    prefix,
    type,
    current,
  }: {
    prefix?: string;
    type?: string;
    current: string | undefined;
  }) {
    if (prefix) super(`Prefix mismatch: ${prefix} !== ${current}`);
    else if (type) super(`Type mismatch: ${type} !== ${current}`);
    else super(`Operation mismatch: ${current}`);
  }
}

export class OperationRejectedError extends Error {
  constructor(operation: string | undefined) {
    super(
      operation === undefined
        ? "Operation not provided"
        : `Operation cancelled: ${operation}`
    );
  }
}

export type OperationCancellation = () => void;
export type OperationCompletion = <T>(state: T) => void;

export interface Operation<T extends string = string, S = unknown> {
  readonly type: T;
  // operation meta data
  name?: string;
  progress?: number;
  silence?: boolean;
  // user state data
  state: S;

  // TODO: move outside of redux store
  // TODO: provide abort controller
  // callbacks for cleanup
  cancellation?: OperationCancellation;
  completion?: OperationCompletion;
}

export const isOperationOfType = <O extends Operation>(
  operation: Operation | undefined,
  type: O["type"]
): operation is O => operation?.type === type;

export const isOperationOfGroup = <G extends Operation>(
  operation: Operation | undefined,
  prefix: string
): operation is G => !!operation?.type.startsWith(prefix);

export const operationStateOfType = <O extends Operation>(
  operation: Operation | undefined,
  type: O["type"]
): O["state"] | undefined =>
  isOperationOfType(operation, type) ? operation.state : undefined;

export const operationStateOfGroup = <G extends Operation>(
  operation: Operation | undefined,
  prefix: string
): G["state"] | undefined =>
  isOperationOfGroup(operation, prefix) ? operation.state : undefined;
