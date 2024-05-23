import { useAppSelector } from "../../../app/hooks";
import { Operation, operationStateOfType } from "../types/operation";

/// Shorthand to acccess specific operation state
export const useOperationState = <O extends Operation>(type: O["type"]) =>
  useAppSelector((state) =>
    operationStateOfType(state.operation.current, type)
  );

/// Shorthand to select from specific operation state
export const useOperationStateSelector = <O extends Operation, S>(
  type: O["type"],
  selector: (state: O["state"] | undefined) => S
) =>
  useAppSelector((state) =>
    selector(operationStateOfType(state.operation.current, type))
  );
