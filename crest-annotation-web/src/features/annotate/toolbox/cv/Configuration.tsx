import React, { useCallback, useEffect, useState } from "react";
import { Cancel, CheckCircle } from "@mui/icons-material";
import {
  Button,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Check from "@mui/icons-material/Check";
import { cvActivateAlgorithm } from "./thunks";
import { Algorithm, CvBackendConfig, CvToolInfo } from "./types";
import { cvInfo } from "../../../../api/cvApi";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { updateToolState } from "../../slice/toolbox";
import { Tool, ToolStatus } from "../../types/toolbox";

/**
 * Basic configuration for the CV tool
 *
 * It allows to select the backend and the algorithm.
 * Once the algorithm is selected, the pane will be
 * hidden in favor of the algorithm's configuration.
 */
export const Configuration = () => {
  const dispatch = useAppDispatch();

  const info = useAppSelector(
    (state) => state.toolbox.tools[Tool.Cv] as CvToolInfo | undefined
  );

  const [state, setState] = useState<Partial<CvBackendConfig>>(
    info?.backend || {}
  );

  const [algorithm, setAlgorithm] = useState(info?.algorithm);

  useEffect(() => {
    if (info?.backend)
      // override component state from store
      setState(info.backend);
    else
      setState({
        // restore from local storage
        url: localStorage.getItem("cv-backend") || undefined,
      });
  }, [info]);

  const activateBackend = useCallback(
    (url: string, data: { algorithms: Algorithm[] }) => {
      console.log("Backend available");
      dispatch(
        updateToolState({
          tool: Tool.Cv,
          state: {
            // tool is not ready yet
            status: ToolStatus.Failed,
            backend: { url: url, state: true, algorithms: data.algorithms },
          } as CvToolInfo,
        })
      );
      // persist the backend URL in local storage
      localStorage.setItem("cv-backend", url);
    },
    [dispatch]
  );

  const resetBackend = useCallback(
    (url: string, error: unknown) => {
      console.log("Backend not available", error);
      dispatch(
        updateToolState({
          tool: Tool.Cv,
          state: {
            // tool is not ready yet
            status: ToolStatus.Failed,
            backend: undefined,
          } as CvToolInfo,
        })
      );
      // clear the backend URL in local storage
      localStorage.removeItem("cv-backend");
    },
    [dispatch]
  );

  // fetch available algorithms when backend is specified
  const validateBackend = useCallback(() => {
    const url = state.url;
    if (url)
      cvInfo(url)
        .then((response) => response.json())
        .then((data) => activateBackend(url, data))
        .catch((error) => resetBackend(url, error));
  }, [activateBackend, resetBackend, state.url]);

  const applyChanges = useCallback(() => {
    const details = state.algorithms?.find((a) => a.id === algorithm);
    if (details === undefined)
      return console.log(`Unknown algorithm ${algorithm}`);
    // activate the algorithm
    dispatch(cvActivateAlgorithm({ algorithm: details }));
  }, [dispatch, state, algorithm]);

  return (
    <Stack padding={2} spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          fullWidth
          variant="filled"
          label="Backend"
          value={state.url || ""}
          onChange={(e) =>
            setState((current) => ({
              ...current,
              url: e.target.value,
            }))
          }
        />
        <IconButton onClick={validateBackend}>
          <Check />
        </IconButton>
      </Stack>
      {state.state === true && (
        <Stack direction="row" alignItems="center" gap={1}>
          <CheckCircle color="success" />
          <Typography color="success">Backend available</Typography>
        </Stack>
      )}
      {state.state === false && (
        <Stack direction="row" alignItems="center" gap={1}>
          <Cancel color="error" />
          <Typography color="error">Backend not responding properly</Typography>
        </Stack>
      )}

      {state.algorithms && (
        <>
          <Divider />
          <TextField
            fullWidth
            variant="filled"
            label="Algorithm"
            select
            value={algorithm || ""}
            onChange={(e) => setAlgorithm(e.target.value)}
          >
            {state.algorithms.map((algorithm) => (
              <MenuItem key={algorithm.id} value={algorithm.id}>
                {algorithm.name}
              </MenuItem>
            ))}
          </TextField>
          <Button onClick={applyChanges} variant="contained">
            Load algorithm
          </Button>
        </>
      )}
    </Stack>
  );
};
