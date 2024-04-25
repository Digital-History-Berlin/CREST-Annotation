import React, { useCallback, useState } from "react";
import { Button, Stack } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../../app/hooks";
import { configureTool } from "../../../slice/toolbox";
import { Tool } from "../../../types/toolbox";
import { cvResetAlgorithm } from "../thunks";
import { CvToolInfo } from "../types";

export const Configuration = () => {
  const dispatch = useAppDispatch();

  const info = useAppSelector(
    (state) => state.toolbox.tools[Tool.Cv] as CvToolInfo | undefined
  );

  const [state, _setState] = useState<Partial<unknown>>(info?.config || {});

  const resetAlgorithm = useCallback(
    () => dispatch(cvResetAlgorithm()),
    [dispatch]
  );

  const _applyChanges = useCallback(() => {
    console.log("Applying changes");
    // activate changes
    dispatch(configureTool({ tool: Tool.Cv, config: state }));
  }, [dispatch, state]);

  return (
    <Stack padding={2} spacing={2}>
      <Button onClick={resetAlgorithm} variant="contained">
        Reset Algorithm
      </Button>
    </Stack>
  );
};
