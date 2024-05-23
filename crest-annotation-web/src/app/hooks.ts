import { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

/// Simple dialog controller
export const useDialog = <T = unknown>() => {
  const [state, setState] = useState<{
    open: boolean;
    data?: T;
  }>({
    open: false,
  });

  const handleOpen = useCallback(
    (data?: T) => setState({ open: true, data }),
    []
  );

  const handleClose = useCallback(
    () => setState({ open: false, data: undefined }),
    []
  );

  return useMemo(
    () => ({ open: state.open, data: state.data, handleOpen, handleClose }),
    [handleOpen, handleClose, state]
  );
};
