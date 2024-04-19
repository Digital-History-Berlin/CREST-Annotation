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
import { CvToolConfig, CvToolInfo } from "./types";
import { cvInfo } from "../../../../api/cvApi";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { configureTool } from "../../slice/toolbox";
import { Tool } from "../../types/toolbox";

export const Configuration = () => {
  const dispatch = useAppDispatch();

  const info = useAppSelector(
    (state) => state.toolbox.tools[Tool.Cv] as CvToolInfo | undefined
  );

  const [state, setState] = useState<Partial<CvToolConfig>>(info?.config || {});

  // update state when config changes
  useEffect(() => {
    if (info?.config) setState(info.config);
    else
      setState({
        // restore from local storage if not specified
        backend: localStorage.getItem("cv-backend") || undefined,
      });
  }, [info]);

  // fetch available algorithms when backend is specified
  const validateBackend = useCallback(() => {
    const backend = state.backend;
    if (backend)
      cvInfo(backend)
        .then((response) => response.json())
        .then((data) => {
          console.log("Backend available");
          setState({
            backend: backend,
            state: true,
            algorithms: data.algorithms,
          });
          // persist the backend URL in local storage
          localStorage.setItem("cv-backend", backend);
        })
        .catch((error) => {
          console.log("Backend not available", error);
          setState({
            backend: backend,
            state: false,
            algorithms: undefined,
          });
          // clear the backend URL in local storage
          localStorage.removeItem("cv-backend");
        });
  }, [state.backend]);

  const applyChanges = useCallback(() => {
    console.log("Applying changes");
    // activate changes
    dispatch(configureTool({ tool: Tool.Cv, config: state }));
  }, [dispatch, state]);

  return (
    <Stack padding={2} spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          fullWidth
          variant="filled"
          label="Backend"
          value={state.backend || ""}
          onChange={(e) =>
            setState((current) => ({ ...current, backend: e.target.value }))
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
            value={state.algorithm || ""}
            onChange={(e) =>
              setState((current) => ({ ...current, algorithm: e.target.value }))
            }
          >
            {state.algorithms.map((algorithm) => (
              <MenuItem key={algorithm.id} value={algorithm.id}>
                {algorithm.name}
              </MenuItem>
            ))}
          </TextField>
          <Button onClick={applyChanges} variant="contained">
            Apply
          </Button>
        </>
      )}
    </Stack>
  );
};
