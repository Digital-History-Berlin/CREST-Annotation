import React, { useCallback, useEffect } from "react";
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
import { ToolPane } from "./ToolPane";
import { info } from "../../../../api/cvApi";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { SegmentConfig, updateToolConfig } from "../../slice/configs";
import { Tool } from "../../slice/tools";

interface IProps {
  onUpdate: (tool: Tool) => void;
  loading: boolean;
}

const SegmentPane = ({ onUpdate, loading }: IProps) => {
  const dispatch = useAppDispatch();

  const config = useAppSelector((state) => state.configs[Tool.Segment]);

  const updateConfig = useCallback(
    (config: Partial<SegmentConfig>) => {
      dispatch(updateToolConfig({ tool: Tool.Segment, config }));
    },
    [dispatch]
  );

  useEffect(
    () => updateConfig({ state: undefined }),
    [updateConfig, config.backend]
  );

  // fetch available algorithms when backend is specified
  const validateBackend = () => {
    if (config.backend)
      info(config.backend)
        .then((response) => response.json())
        .then((data) => {
          updateConfig({ state: true, algorithms: data.algorithms });
          console.log("Backend available");
        })
        .catch((e) => {
          updateConfig({ state: false, algorithms: undefined });
          console.log(e);
        });
  };

  const applyChanges = async () => {
    // apply changes by reloading the tool
    // TODO: maybe improve this
    onUpdate(Tool.Segment);
  };

  return (
    <ToolPane loading={loading}>
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
        {config.state === true && (
          <Stack direction="row" alignItems="center" gap={1}>
            <ValidIcon color="success" />
            <Typography color="success">Backend available</Typography>
          </Stack>
        )}
        {config.state === false && (
          <Stack direction="row" alignItems="center" gap={1}>
            <InvalidIcon color="error" />
            <Typography color="error">
              Backend not responding properly
            </Typography>
          </Stack>
        )}

        {config.algorithms && (
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
              {config.algorithms.map((algorithm) => (
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
    </ToolPane>
  );
};

export default SegmentPane;
