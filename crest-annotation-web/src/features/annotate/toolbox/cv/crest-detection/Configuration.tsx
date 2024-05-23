import React, { Fragment, useCallback, useEffect, useMemo } from "react";
import { Settings } from "@mui/icons-material";
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  IconButton,
  LinearProgress,
  Stack,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import { decide, edit, select } from "./thunks";
import {
  CvCrestDetectionToolConfig,
  CvCrestDetectionToolOperation,
  useCvCrestDetectionToolConfig,
  useCvCrestDetectionToolData,
} from "./types";
import { useGetProjectLabelsQuery } from "../../../../../api/enhancedApi";
import {
  useAppDispatch,
  useAppSelector,
  useDialog,
} from "../../../../../app/hooks";
import Dot from "../../../../../components/Dot";
import ToolSettingsDialog from "../../../components/dialogs/ToolSettingsDialog";
import { useOperationState } from "../../../hooks/use-operation-state";
import { useAnnotationProject } from "../../../slice/annotations";
import { operationCancel } from "../../../slice/operation";
import { selectToolboxLabelId } from "../../../slice/toolbox";
import { ConfigFC } from "../../../types/components";
import { useCvResetAlgorithm } from "../hooks";

export const Configuration: ConfigFC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const project = useAnnotationProject();

  const resetAlgorithm = useCvResetAlgorithm();
  const { data } = useCvCrestDetectionToolData();
  const { config, updateConfig } = useCvCrestDetectionToolConfig();

  // current operation state
  const operation = useOperationState<CvCrestDetectionToolOperation>(
    "tool/cv/crest-detection"
  );

  // advanced dialogs
  const skipDuplicatesDialog = useDialog();
  const skipCoveredDialog = useDialog();

  // currently selected label
  const { data: labels } = useGetProjectLabelsQuery({ projectId: project.id });
  const selectedLabelId = useAppSelector(selectToolboxLabelId);
  const label = useMemo(
    () =>
      operation
        ? operation.label
        : labels?.find((label) => label.id === selectedLabelId),
    [operation, labels, selectedLabelId]
  );

  const handleSelect = useCallback(() => {
    if (label)
      dispatch(select({ index: 0, label }))
        .unwrap()
        .catch(console.error);
  }, [dispatch, label]);

  const handlePreview = useCallback(
    () => dispatch(operationCancel({ id: undefined })),
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
      dispatch(decide({ accept: false, proceed: true }))
        .unwrap()
        .catch(console.error),
    [dispatch]
  );

  const handleEdit = useCallback(
    () => dispatch(edit()).unwrap().catch(console.error),
    [dispatch]
  );

  const handleChange = (patch: Partial<CvCrestDetectionToolConfig>) => {
    updateConfig(patch);
    // apply the configuration by re-selecting the active shape
    if (operation)
      dispatch(select({ index: operation.index, label: operation.label }))
        .unwrap()
        .catch(console.error);
  };

  // HACK: auto-start the selection process
  // this should be done from thunks,
  // but it is difficult to access the active label from there
  useEffect(
    () => {
      if (data?.boundingBoxes && config?.autostart) handleSelect();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data?.boundingBoxes, handleSelect]
  );

  if (!config || !data) return <Fragment />;

  return (
    <Stack padding={2} spacing={2} height="100%">
      <Stack
        direction="column"
        sx={{
          border: `solid 1px ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          padding={1}
          paddingLeft={2}
        >
          {label && <Dot color={label.color} disablePadding />}
          <Typography variant="body1">
            {label?.name || "No label selected"}
          </Typography>
          <Box flexGrow={1} />
          {operation && (
            <Button color="error" onClick={handlePreview}>
              Stop selection
            </Button>
          )}
          {!operation && (
            <Button disabled={!label} onClick={handleSelect}>
              Select masks
            </Button>
          )}
        </Stack>
        {operation && data.boundingBoxes && (
          <>
            <LinearProgress
              variant="determinate"
              value={(100 * operation.index) / data.boundingBoxes?.length}
            />
          </>
        )}
      </Stack>

      {operation !== undefined && (
        <>
          <ButtonGroup fullWidth>
            <Button value="preview" onClick={handleAccept}>
              Accept
            </Button>
            {!operation.edit && (
              <Button value="preview" onClick={handleEdit}>
                Edit
              </Button>
            )}
            <Button value="preview" onClick={handleReject}>
              Reject
            </Button>
          </ButtonGroup>
          <FormHelperText>
            [Enter]: Accept, [Space]: Edit, [Esc]: Reject
          </FormHelperText>
        </>
      )}

      <Divider />
      <FormLabel>Basic configuration</FormLabel>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              disabled={config === undefined}
              checked={!!config.autostart}
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
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              disabled={config === undefined}
              checked={!!config.showPixelMask}
              onChange={(_, showPixelMask) => handleChange({ showPixelMask })}
            />
          }
          label="Show pixel masks"
        />
      </FormGroup>

      <Divider />
      <FormLabel>Mask selection</FormLabel>
      <FormGroup>
        <Stack direction="row" justifyContent="space-between">
          <FormControlLabel
            control={
              <Switch
                disabled={config === undefined}
                checked={!!config.skipDuplicates}
                onChange={(_, skipDuplicates) =>
                  handleChange({ skipDuplicates })
                }
              />
            }
            label="Skip duplicate boxes"
          />
          <IconButton
            onClick={skipDuplicatesDialog.handleOpen}
            disabled={!config.skipDuplicates}
          >
            <Settings />
          </IconButton>
        </Stack>
        <FormHelperText>
          Try to avoid presenting duplicates in the mask selection process by
          skipping boxes that are very similar to existing rectangular
          annotations.
        </FormHelperText>
      </FormGroup>

      <FormGroup>
        <Stack direction="row" justifyContent="space-between">
          <FormControlLabel
            control={
              <Switch
                disabled={config === undefined}
                checked={!!config.skipCovered}
                onChange={(_, skipCovered) => handleChange({ skipCovered })}
              />
            }
            label="Skip covered"
          />
          <IconButton
            onClick={skipCoveredDialog.handleOpen}
            disabled={!config.skipCovered}
          >
            <Settings />
          </IconButton>
        </Stack>
        <FormHelperText>
          Try to avoid presenting incorrect masks in the mask selection process
          by skipping boxes that are (almost) completely included in existing
          rectangular annotations.
        </FormHelperText>
      </FormGroup>

      <Box flexGrow={1} />
      <Divider />
      <Button onClick={resetAlgorithm} color="error">
        Change algorithm
      </Button>

      <ToolSettingsDialog
        settings={[
          {
            id: "overlapThreshold",
            label: "Overlap threshold",
            control: "percentage",
            value: config.overlapThreshold,
          },
        ]}
        open={skipDuplicatesDialog.open}
        onClose={skipDuplicatesDialog.handleClose}
        onSubmit={handleChange}
      />
      <ToolSettingsDialog
        settings={[
          {
            id: "coverageThreshold",
            label: "Coverage threshold",
            control: "percentage",
            value: config.coverageThreshold,
          },
        ]}
        open={skipCoveredDialog.open}
        onClose={skipCoveredDialog.handleClose}
        onSubmit={handleChange}
      />
    </Stack>
  );
};
