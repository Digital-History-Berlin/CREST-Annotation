import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
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
import { useCvToolAlgorithm, useCvToolBackend } from "./hooks";
import { cvActivateAlgorithm, cvValidateBackend } from "./thunks";
import { CvAlgorithm } from "./types";
import { useAppDispatch } from "../../../../app/hooks";
import { ConfigFC } from "../../types/components";

/**
 * Basic configuration for the CV tool
 *
 * It allows to select the backend and the algorithm.
 * Once the algorithm is selected, the pane will be
 * hidden in favor of the algorithm's configuration.
 */
export const Configuration: ConfigFC = () => {
  const dispatch = useAppDispatch();
  const backend = useCvToolBackend();
  const algorithm = useCvToolAlgorithm();

  // component input state
  // (store update needs to be triggered manually)
  const [unsafeBackend, setUnsafeBackend] = useState<string>("");
  const [unsafeAlgorithm, setUnsafeAlgorithm] = useState<string>("");

  // check if backend responds properly
  const validateBackend = useCallback(
    async (url: string) => {
      dispatch(cvValidateBackend(url));
    },
    [dispatch]
  );

  // check if algorithm can be loaded properly
  const validateAlgorithm = useCallback(
    async (id: string, algorithms?: CvAlgorithm[]) => {
      const algorithm = algorithms?.find((algorithm) => algorithm.id === id);
      if (!algorithm) return console.warn(`Unknown algorithm: ${id}`);

      // activate the algorithm
      dispatch(cvActivateAlgorithm(algorithm));
    },
    [dispatch]
  );

  const handleChangeBackend = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      setUnsafeBackend(event.target.value),
    []
  );

  const handleValidateBackend = useCallback(() => {
    validateBackend(unsafeBackend);
  }, [validateBackend, unsafeBackend]);

  const handleChangeAlgorithm = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      setUnsafeAlgorithm(event.target.value),
    []
  );

  const handleValidateAlgorithm = useCallback(() => {
    validateAlgorithm(unsafeAlgorithm, backend?.algorithms);
  }, [validateAlgorithm, unsafeAlgorithm, backend]);

  // reload data when store changes
  // (load from local storage if not available)
  useEffect(() => {
    // update the inputs
    setUnsafeBackend(backend?.url || "");
    setUnsafeAlgorithm(algorithm?.id || "");
  }, [backend, algorithm]);

  return (
    <Stack padding={2} spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          fullWidth
          variant="filled"
          label="Backend"
          value={unsafeBackend}
          onChange={handleChangeBackend}
        />
        <IconButton onClick={handleValidateBackend}>
          <Check />
        </IconButton>
      </Stack>
      {backend?.state === true && (
        <Stack direction="row" alignItems="center" gap={1}>
          <CheckCircle color="success" />
          <Typography color="success">Backend available</Typography>
        </Stack>
      )}
      {backend?.state === false && (
        <Stack direction="row" alignItems="center" gap={1}>
          <Cancel color="error" />
          <Typography color="error">Backend not responding properly</Typography>
        </Stack>
      )}

      {backend?.algorithms && (
        <>
          <Divider />
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              select
              fullWidth
              variant="filled"
              label="Algorithm"
              value={unsafeAlgorithm}
              onChange={handleChangeAlgorithm}
            >
              {backend.algorithms.map((algorithm) => (
                <MenuItem key={algorithm.id} value={algorithm.id}>
                  {algorithm.name}
                </MenuItem>
              ))}
            </TextField>
            <IconButton onClick={handleValidateAlgorithm}>
              <Check />
            </IconButton>
          </Stack>
          {algorithm?.id === unsafeAlgorithm && algorithm?.state === true && (
            <Stack direction="row" alignItems="center" gap={1}>
              <CheckCircle color="success" />
              <Typography color="success">Algorithm active</Typography>
            </Stack>
          )}
          {algorithm?.id === unsafeAlgorithm && algorithm?.state === false && (
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
