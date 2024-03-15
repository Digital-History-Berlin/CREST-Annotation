import { useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { MaybePromise } from "../../../types/MaybePromise";

export class ActionCanceledError extends Error {
  public constructor(reason: string, id?: string) {
    super(`Action ${id} canceled: ${reason}`);
  }
}

export type ActionSequenceState<T> =
  | ["ignore"]
  | ["proceed", T]
  | ["resolve", T]
  | ["reject", unknown];

export type ActionSequenceCallback<T> = (
  value: T
) => MaybePromise<ActionSequenceState<T>>;

const throwNotStarted = () => {
  throw new Error("Wrapper not started");
};

/**
 * Provides the ability to combine multiple action stream operations
 */
export class ActionSequence<T> {
  private _resolve: (result: T) => void = throwNotStarted;
  private _reject: (reason: unknown) => void = throwNotStarted;

  // internal stream to chain operations
  private _stream?: Promise<ActionSequenceState<T>>;

  private resolve(value: T): ActionSequenceState<T> {
    this._notification?.(value);
    this.debug("Resolved");
    this._resolve(value);
    return ["resolve", value];
  }

  private reject(reason: unknown): ActionSequenceState<T> {
    this.debug("Rejected");
    this._reject(reason);
    return ["reject", reason];
  }

  private proceed(value: T): ActionSequenceState<T> {
    this._notification?.(value);
    return ["proceed", value];
  }

  private evaluate([state, value]: ActionSequenceState<T>) {
    if (state === "ignore") return this.reject("Sequence error");
    if (state === "resolve") return this.resolve(value);
    if (state === "reject") return this.reject(value);
    return this.proceed(value);
  }

  public constructor(
    public initial: ActionSequenceState<T>,
    public name?: string,
    // receives value updates
    private _notification?: (value: T) => void
  ) {
    this.debug("Created");
    // prepare the initial state
    this._stream = Promise.resolve(this.evaluate(this.initial));
  }

  /**
   * Append an action to the sequence
   */
  public append(callback: ActionSequenceCallback<T>): void {
    if (this._stream === undefined) return;

    const proceed = async (state: ActionSequenceState<T>) => {
      // if the stream is already resolved, ignore the callback
      if (state[0] !== "proceed") return state;

      const result = await callback(state[1]);
      // if the callback resolves to ignore, keep previous state
      return result[0] === "ignore" ? state : result;
    };

    this._stream = this._stream
      .then(proceed)
      // inject an exception handler to re-route to default rejection
      .catch((reason): ActionSequenceState<T> => ["reject", reason])
      .then((result) => this.evaluate(result));
  }

  /**
   * Return the overall promise
   */
  public run(): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.debug("Run");
      // allow execution of code outside of the promise itself
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  /**
   * Cacnel the sequence
   */
  public cancel(reason: unknown) {
    this.reject(reason);
  }

  public debug(message: string) {
    if (this.name) console.debug(`Sequence ${this.name}: ${message}`);
  }
}

export type ActionStreamCallback<T> = () => MaybePromise<T>;
export type CancellationCallback = (reason: string) => void;

/**
 * Encapsulates a single action stream operation
 */
export class ActionStreamOperation {
  // debug name to enable logging
  public name?: string;

  public constructor(
    private _cancellation?: CancellationCallback,
    name?: string,
    public id = uuidv4()
  ) {
    // generate a useful debug name
    this.name = name && `${name} (${id.substring(0, 6)})`;
    this.debug(`Created`);
  }

  public cancel(reason: string) {
    this.debug(`Canceled (${reason})`);
    this._cancellation?.(reason);
  }

  public debug(message: string) {
    if (this.name) console.debug(`Action ${this.name}: ${message}`);
  }

  public debugName() {
    return this.name || this.id;
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
export class ActionStream {
  // current operation
  private _op: ActionStreamOperation | undefined;

  /**
   * Check if the given operation is active
   */
  public active(token: string) {
    return this._op?.id === token;
  }

  /**
   * Cancel the ongoing operation (or a specific operation)
   */
  public cancel(reason: string, token?: string) {
    if (this._op && (!token || this._op?.id === token)) {
      this._op.cancel(reason);
      // reset the current operation
      this._op = undefined;
    }
  }

  /**
   * Start a new operation and return the corresponding promise
   */
  public push<T>(
    callback: ActionStreamCallback<T>,
    cancellation?: CancellationCallback,
    name?: string
  ): Promise<T> {
    // prepare the new operation
    const op = new ActionStreamOperation(cancellation, name);
    // cancel current operation
    this.cancel("New operation");
    // reference to new operation
    this._op = op;

    // execute the operation
    op.debug("Invoked");
    return Promise.resolve()
      .then(callback)
      .then((result) => {
        // If the operation is outdated, discard the promise using an exception.
        // This happens if the operation does not provide its own cancellation,
        // or if the cancellation does not actually reject the promise.
        if (this._op?.id !== op.id)
          throw new ActionCanceledError(
            `Discarded from ${this._op?.debugName()}`,
            op.debugName()
          );

        // operation completed
        op.debug("Resolved");
        this._op = undefined;
        return result;
      })
      .catch((error) => {
        // inject an error handler for logging
        if (error instanceof ActionCanceledError) op.debug(error.message);

        op.debug("Rejected");
        if (this._op?.id === op.id)
          // operation discarded
          this._op = undefined;

        // re-throw in any case to discard the result
        throw error;
      });
  }

  /**
   * Shorthand to start a new sequence
   */
  public begin<T>(sequence: ActionSequence<T>) {
    return this.push(
      () => sequence.run(),
      (reason) => sequence.cancel(reason),
      sequence.name
    );
  }
}

/// Convenience method to handle action stream exceptions
export const swallowCancelation = (callback: (error: unknown) => void) => {
  return (error?: unknown) => {
    if (!(error instanceof ActionCanceledError)) callback(error);
  };
};

/// Convenience method to handle action state manually
export const swallowIgnore = <TState, TResult>(
  callback: (state: ActionSequenceState<TState>) => TResult
) => {
  return (state: ActionSequenceState<TState>) => {
    if (state[0] !== "ignore") callback(state);
  };
};

export const useActionStream = () => useMemo(() => new ActionStream(), []);
