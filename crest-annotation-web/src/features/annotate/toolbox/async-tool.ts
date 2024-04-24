import { AppDispatch } from "../../../app/store";
import {
  RootOperation,
  operationBegin,
  operationCancel,
  operationComplete,
  operationUpdate,
} from "../slice/operation";
import { Begin } from "../types/operation";

export type AsyncToolOperationApi<T extends RootOperation> = {
  operation: T;
  update: (state: Omit<T, "id">) => void;
  complete: () => void;
  cancel: () => void;
};

export type AsyncToolOperationCallback<T extends RootOperation> = (
  operationApi: AsyncToolOperationApi<T>
) => Promise<void>;

export type AsyncToolOperationOptions<T extends RootOperation> = {
  initial: Begin<T>;
  dispatch: AppDispatch;
  cancelOnError?: boolean;
};

export const withAsyncToolOperation = <T extends RootOperation>(
  { initial, dispatch, cancelOnError }: AsyncToolOperationOptions<T>,
  callback: AsyncToolOperationCallback<T>
) => {
  dispatch(operationBegin(initial))
    .unwrap()
    .then((operation) => {
      const update = (state: Omit<T, "id">) =>
        dispatch(
          operationUpdate({
            id: operation.id,
            ...state,
          } as T)
        );

      const complete = () => dispatch(operationComplete({ id: operation.id }));
      const cancel = () => dispatch(operationCancel({ id: operation.id }));

      return callback({
        operation: operation as T,
        update,
        complete,
        cancel,
      }).catch((error) => {
        console.log(error);
        // cancelation must be explicitly disabled
        if (cancelOnError !== false) dispatch(operationCancel(operation));
      });
    })
    // catch errors in dispatch
    .catch(console.log);
};
