import React, { useCallback, useEffect, useState } from "react";
import { Cancel, CheckCircle } from "@mui/icons-material";
import {
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
import { useAppDispatch } from "../../../../app/hooks";
import { resetToolState } from "../../slice/toolbox";
import { ConfigFC } from "../../types/components";
import { Tool, ToolStatus } from "../../types/toolbox";

/**
 * Basic configuration for the CV tool
 *
 * It allows to select the backend and the algorithm.
 * Once the algorithm is selected, the pane will be
 * hidden in favor of the algorithm's configuration.
 *
 * TODO: The behaviour can be a bit messy, clean up the states
 */
export const Configuration: ConfigFC<CvToolInfo> = ({ info }) => {
  const dispatch = useAppDispatch();

  const [backend, setBackend] = useState<Partial<CvBackendConfig>>(
    info?.backend || {}
  );

  const [algorithm, setAlgorithm] = useState(info?.algorithm);
  const [algorithmState, setAlgorithmState] = useState<boolean>();

  const activateBackend = useCallback(
    (url: string, data: { algorithms: Algorithm[] }) => {
      console.log("Backend available");
      dispatch(
        resetToolState({
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
      console.error("Backend not available", error);
      dispatch(
        resetToolState({
          tool: Tool.Cv,
          state: {
            // tool is not ready yet
            status: ToolStatus.Failed,
            backend: { url: url, state: false },
          } as CvToolInfo,
        })
      );
      // clear the backend URL in local storage
      localStorage.removeItem("cv-backend");
    },
    [dispatch]
  );

  // fetch available algorithms when backend is specified
  const validateBackend = useCallback(
    (url?: string) => {
      if (url?.length)
        cvInfo(url)
          .then((response) => response.json())
          .then((data) => activateBackend(url, data))
          .catch((error) => resetBackend(url, error));
    },
    [activateBackend, resetBackend]
  );

  const algorithmReady = useCallback(() => {
    console.log("Algorithm activated");
    setAlgorithmState(true);
  }, []);

  const algorithmFailed = useCallback((error: unknown) => {
    console.error("Failed to activate algorithm", error);
    setAlgorithmState(false);
  }, []);

  const applyChanges = useCallback(() => {
    const details = backend.algorithms?.find((a) => a.id === algorithm);
    if (details === undefined)
      return console.log(`Unknown algorithm ${algorithm}`);

    // activate the algorithm
    dispatch(cvActivateAlgorithm({ algorithm: details }))
      .unwrap()
      .then(algorithmReady)
      .catch(algorithmFailed);
  }, [algorithmReady, algorithmFailed, dispatch, backend, algorithm]);

  useEffect(
    () => {
      if (info?.backend)
        // override component state from store
        setBackend(info.backend);
      else if (!backend.url?.length)
        // restore from local storage
        validateBackend(localStorage.getItem("cv-backend") || undefined);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [validateBackend, info?.backend]
  );

  // reset the state when backend or algorithm changes
  useEffect(() => setAlgorithmState(undefined), [info?.backend, algorithm]);

  return (
    <Stack padding={2} spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          fullWidth
          variant="filled"
          label="Backend"
          value={backend.url || ""}
          onChange={(e) =>
            setBackend((current) => ({
              ...current,
              url: e.target.value,
            }))
          }
        />
        <IconButton onClick={() => validateBackend(backend.url)}>
          <Check />
        </IconButton>
      </Stack>
      {backend.state === true && (
        <Stack direction="row" alignItems="center" gap={1}>
          <CheckCircle color="success" />
          <Typography color="success">Backend available</Typography>
        </Stack>
      )}
      {backend.state === false && (
        <Stack direction="row" alignItems="center" gap={1}>
          <Cancel color="error" />
          <Typography color="error">Backend not responding properly</Typography>
        </Stack>
      )}

      {backend.algorithms && (
        <>
          <Divider />
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              fullWidth
              variant="filled"
              label="Algorithm"
              select
              value={algorithm || ""}
              onChange={(e) => setAlgorithm(e.target.value)}
            >
              {backend.algorithms.map((algorithm) => (
                <MenuItem key={algorithm.id} value={algorithm.id}>
                  {algorithm.name}
                </MenuItem>
              ))}
            </TextField>
            <IconButton onClick={applyChanges}>
              <Check />
            </IconButton>
          </Stack>
          {algorithmState === true && (
            <Stack direction="row" alignItems="center" gap={1}>
              <CheckCircle color="success" />
              <Typography color="success">Algorithm active</Typography>
            </Stack>
          )}
          {algorithmState === false && (
            <Stack direction="row" alignItems="center" gap={1}>
              <Cancel color="error" />
              <Typography color="error">
                Failed to activate algorithm
              </Typography>
            </Stack>
          )}
        </>
      )}
    </Stack>
  );
};
