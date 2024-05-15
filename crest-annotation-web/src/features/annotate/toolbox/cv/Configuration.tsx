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
import { cvActivateAlgorithm } from "./thunks";
import { CvAlgorithm, CvBackendConfig } from "./types";
import { cvInfo } from "../../../../api/cvApi";
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

  const { backend, updateBackend } = useCvToolBackend();
  const { algorithm } = useCvToolAlgorithm();

  // component input state
  // (store update needs to be triggered manually)
  const [unsafeBackend, setUnsafeBackend] = useState<string>("");
  const [unsafeAlgorithm, setUnsafeAlgorithm] = useState<string>("");

  const backendReady = useCallback(
    (url: string, data: { algorithms: CvAlgorithm[] }): CvBackendConfig => {
      const valid = { url: url, state: true, algorithms: data.algorithms };
      updateBackend(valid);
      // persist the backend URL in local storage
      localStorage.setItem("cv-backend", url);
      // response for caller promise
      return valid;
    },
    [updateBackend]
  );

  const backendFailed = useCallback(
    (url: string, error: unknown): CvBackendConfig => {
      const invalid = { url: url, state: false };
      updateBackend(invalid);
      // clear the backend URL in local storage
      localStorage.removeItem("cv-backend");
      console.log("Backend not available", error);
      // response for caller promise
      return invalid;
    },
    [updateBackend]
  );

  // check if backend responds properly
  const validateBackend = useCallback(
    async (url?: string) => {
      if (url?.length)
        return await cvInfo(url)
          .then((response) => response.json())
          .then((data) => backendReady(url, data))
          .catch((error) => backendFailed(url, error));
      return undefined;
    },
    [backendReady, backendFailed]
  );

  const algorithmReady = useCallback((algorithm: CvAlgorithm) => {
    // persist the algorithm in local storage
    localStorage.setItem("cv-algorithm", algorithm.id);
  }, []);

  const algorithmFailed = useCallback(
    (algorithm: CvAlgorithm, error: unknown) => {
      // clear the backend URL in local storage
      localStorage.removeItem("cv-algorithm");
      console.error("Failed to activate algorithm", error);
    },
    []
  );

  // check if algorithm can be loaded properly
  const validateAlgorithm = useCallback(
    async (id: string, algorithms?: CvAlgorithm[]) => {
      const algorithm = algorithms?.find((algorithm) => algorithm.id === id);
      if (!algorithm) return console.log(`Unknown algorithm: ${id}`);

      // activate the algorithm
      await dispatch(cvActivateAlgorithm({ algorithm }))
        .unwrap()
        .then(() => algorithmReady(algorithm))
        .catch((error) => algorithmFailed(algorithm, error));
    },
    [algorithmReady, algorithmFailed, dispatch]
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
    const restore = async () => {
      const url = localStorage.getItem("cv-backend") || undefined;
      const id = localStorage.getItem("cv-algorithm") || undefined;
      const backend = await validateBackend(url);
      // proceed if the backend was restored properly
      if (id && backend) await validateAlgorithm(id, backend.algorithms);
      else console.log(`Algorithm could not be restored`);
    };

    if (backend === undefined) {
      // try to restore from local storage
      restore()
        .then(() => console.debug("Restored backend from local storage"))
        .catch(console.error);
    } else {
      // update the inputs
      setUnsafeBackend(backend?.url || "");
      setUnsafeAlgorithm(algorithm?.id || "");
    }
  }, [validateAlgorithm, validateBackend, backend, algorithm]);

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
          {algorithm?.state === true && (
            <Stack direction="row" alignItems="center" gap={1}>
              <CheckCircle color="success" />
              <Typography color="success">Algorithm active</Typography>
            </Stack>
          )}
          {algorithm?.state === false && (
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
