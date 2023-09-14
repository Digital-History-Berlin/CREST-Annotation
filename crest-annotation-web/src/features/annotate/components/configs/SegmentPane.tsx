import React, { useEffect, useState } from "react";
import {
  Button,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import InvalidIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";
import ValidIcon from "@mui/icons-material/CheckCircle";
import { info } from "../../../../api/cvApi";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import SidebarContainer from "../../../../components/SidebarContainer";
import { Tool, ToolState, updateToolConfig } from "../../slice/tools";

type Algorithms = [{ id: string; name: string }];

interface IProps {
  onUpdate: (tool: Tool) => void;
}

const SegmentPane = ({ onUpdate }: IProps) => {
  const dispatch = useAppDispatch();

  const [backendState, setBackendState] = useState<boolean>();
  const [algorithms, setAlgorithms] = useState<Algorithms>();

  const config = useAppSelector(
    (state) => state.tools.toolConfigs[Tool.Segment]
  );
  // TODO: it is weird to access the active tool here
  // maybe place the tool state beside the tool config
  const state = useAppSelector((state) => state.tools.activeTool.state);

  useEffect(() => setBackendState(undefined), [config.backend]);

  // fetch available algorithms when backend is specified
  const validateBackend = () => {
    if (config.backend)
      info(config.backend)
        .then((response) => response.json())
        .then((data) => {
          setBackendState(true);
          setAlgorithms(data.algorithms);
          console.log("Backend available");
        })
        .catch((e) => {
          setBackendState(false);
          setAlgorithms(undefined);
          console.log(e);
        });
  };

  const applyChanges = async () => {
    // apply changes by reloading the tool
    // TODO: maybe improve this
    onUpdate(Tool.Segment);
  };

  return (
    <SidebarContainer title={"Segmentation Settings"}>
      <Stack padding={2} spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            fullWidth
            variant="filled"
            label="Backend"
            value={config.backend || ""}
            onChange={(e) =>
              dispatch(
                updateToolConfig({
                  tool: Tool.Segment,
                  config: { backend: e.target.value },
                })
              )
            }
          />
          <IconButton onClick={validateBackend}>
            <CheckIcon />
          </IconButton>
        </Stack>
        {backendState === true && (
          <Stack direction="row" alignItems="center" gap={1}>
            <ValidIcon color="success" />
            <Typography color="success">Backend available</Typography>
          </Stack>
        )}
        {backendState === false && (
          <Stack direction="row" alignItems="center" gap={1}>
            <InvalidIcon color="error" />
            <Typography color="error">
              Backend not responding properly
            </Typography>
          </Stack>
        )}

        {algorithms && (
          <>
            <Divider />
            <TextField
              fullWidth
              variant="filled"
              label="Algorithm"
              select
              value={config.algorithm || ""}
              onChange={(e) =>
                dispatch(
                  updateToolConfig({
                    tool: Tool.Segment,
                    config: { algorithm: e.target.value },
                  })
                )
              }
            >
              {algorithms.map((algorithm) => (
                <MenuItem key={algorithm.id} value={algorithm.id}>
                  {algorithm.name}
                </MenuItem>
              ))}
            </TextField>
            <Button
              onClick={applyChanges}
              variant="contained"
              disabled={state === ToolState.Preparing}
            >
              Apply
            </Button>
          </>
        )}
      </Stack>
    </SidebarContainer>
  );
};

export default SegmentPane;
