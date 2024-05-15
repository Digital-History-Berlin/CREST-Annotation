import React, { useCallback } from "react";
import {
  Button,
  ButtonGroup,
  Divider,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Stack,
  Switch,
} from "@mui/material";
import { decide, select } from "./thunks";
import {
  CvCrestDetectionToolConfig,
  CvCrestDetectionToolOperationState,
} from "./types";
import { useAppDispatch } from "../../../../../app/hooks";
import { operationCancel } from "../../../slice/operation";
import { ConfigFC } from "../../../types/components";
import {
  useCvResetAlgorithm,
  useCvToolConfig,
  useCvToolOperationState,
} from "../hooks";

const defaultConfig: CvCrestDetectionToolConfig = {
  autostart: true,
  skipDuplicates: true,
  skipCovered: true,
  showPixelMask: false,
};

export const Configuration: ConfigFC = () => {
  const dispatch = useAppDispatch();
  const resetAlgorithm = useCvResetAlgorithm();

  const operation = useCvToolOperationState<CvCrestDetectionToolOperationState>(
    "cv/crest-detection/select"
  );

  const { config, updateConfig } = useCvToolConfig({
    frontend: "crest-detection",
    defaultConfig,
  });

  const handleSelect = useCallback(
    () =>
      dispatch(select({ index: 0 }))
        .unwrap()
        .catch(console.error),
    [dispatch]
  );

  const handleAccept = useCallback(
    () =>
      dispatch(decide({ accept: true, proceed: true }))
        .unwrap()
        .catch(console.error),
    [dispatch]
  );

  const handleReject = useCallback(
    () =>
      dispatch(decide({ accept: false, proceed: false }))
        .unwrap()
        .catch(console.error),
    [dispatch]
  );

  const handleEdit = useCallback(() => undefined, [dispatch]);

  const handlePreview = useCallback(
    () => dispatch(operationCancel()),
    [dispatch]
  );

  const handleChange = (patch: Partial<CvCrestDetectionToolConfig>) => {
    updateConfig(patch);
    // apply the configuration by re-selecting the active shape
    if (operation)
      dispatch(select({ index: operation.index }))
        .unwrap()
        .catch(console.error);
  };

  return (
    <Stack padding={2} spacing={2}>
      <FormLabel>Basic configuration</FormLabel>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={config.autostart}
              onChange={(_, autostart) => handleChange({ autostart })}
            />
          }
          label="Autostart"
        />
        <FormHelperText>
          When a new image is loaded and the tool is active, it will
          automatically start the mask selection process.
        </FormHelperText>
      </FormGroup>

      <Divider />
      <FormLabel>Mask selection</FormLabel>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={config.skipDuplicates}
              onChange={(_, skipDuplicates) => handleChange({ skipDuplicates })}
            />
          }
          label="Skip duplicate boxes"
        />
        <FormHelperText>
          Try to avoid presenting duplicates in the mask selection process by
          skipping boxes that are very similar to existing rectangular
          annotations.
        </FormHelperText>
      </FormGroup>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={config.skipCovered}
              onChange={(_, skipCovered) => handleChange({ skipCovered })}
            />
          }
          label="Skip covered"
        />
        <FormHelperText>
          Try to avoid presenting incorrect masks in the mask selection process
          by skipping boxes that are (almost) completely included in existing
          rectangular annotations.
        </FormHelperText>
      </FormGroup>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={config.showPixelMask}
              onChange={(_, showPixelMask) => handleChange({ showPixelMask })}
            />
          }
          label="Show pixel masks"
        />
      </FormGroup>

      <Divider />
      {operation === undefined && (
        <Button value="select" onClick={handleSelect}>
          Select individual masks
        </Button>
      )}
      {operation !== undefined && (
        <>
          <ButtonGroup fullWidth>
            <Button value="preview" onClick={handleAccept}>
              Accept
            </Button>
            <Button value="preview" onClick={handleEdit}>
              Edit
            </Button>
            <Button value="preview" onClick={handleReject}>
              Reject
            </Button>
          </ButtonGroup>
          <Button value="preview" onClick={handlePreview}>
            Show all masks
          </Button>
        </>
      )}

      <Button onClick={resetAlgorithm} color="error">
        Change algorithm
      </Button>
    </Stack>
  );
};
