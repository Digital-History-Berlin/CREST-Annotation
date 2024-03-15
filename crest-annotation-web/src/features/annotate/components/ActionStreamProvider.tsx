import { PropsWithChildren, createContext, useContext } from "react";
import { ActionStream } from "../hooks/use-action-stream";

export const InteractionContext = createContext<ActionStream | undefined>(
  undefined
);

/// Provides a single action stream that can be used from children
const ActionStreamProvider = ({
  stream,
  children,
}: PropsWithChildren<{ stream: ActionStream }>) => {
  return (
    <InteractionContext.Provider value={stream}>
      {children}
    </InteractionContext.Provider>
  );
};

export const useLocalActionStream = () => {
  // context must be available
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return useContext(InteractionContext)!;
};

export default ActionStreamProvider;
