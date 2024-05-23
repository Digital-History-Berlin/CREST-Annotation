import { useCallback, useEffect, useState } from "react";
import {
  Button,
  DialogActions,
  DialogContent,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import DefaultDialog from "../../../../components/dialogs/DefaultDialog";

export const percentageMarks = [
  0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0,
].map((value) => ({ value, label: `${value * 100}%` }));

interface Setting {
  id: string;
  label: string;
  control: "percentage" | "switch" | "text";
  value: unknown;
}

interface IProps {
  settings: Setting[];
  open: boolean;
  onSubmit: (settings: { [key: string]: unknown }) => string | boolean | void;
  onClose: () => void;
  closeOnSuccess?: boolean;
}

const ToolSettingsDialog = ({
  settings,
  open,
  onSubmit,
  onClose,
  closeOnSuccess = true,
}: IProps) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSubmit = useCallback(() => {
    const error = onSubmit(
      Object.fromEntries(localSettings.map(({ id, value }) => [id, value]))
    );
    if (!error && closeOnSuccess) onClose();
  }, [onSubmit, onClose, closeOnSuccess, localSettings]);

  const handleChange = useCallback((id: string, value: unknown) => {
    setLocalSettings((current) =>
      current.map((setting) =>
        setting.id === id ? { ...setting, value } : setting
      )
    );
  }, []);

  // update from parent changes
  useEffect(() => setLocalSettings(settings), [settings]);

  const renderPercentage = ({ id, label, value }: Setting) => (
    <Stack key={id}>
      <Typography variant="body1">{label}</Typography>
      <Stack direction="row" px={2}>
        <Slider
          value={value as number | number[]}
          onChange={(_, value) => handleChange(id, value)}
          marks={percentageMarks}
          min={0.0}
          max={1.0}
          step={0.1}
        />
      </Stack>
    </Stack>
  );

  return (
    <DefaultDialog
      onClose={onClose}
      open={open}
      maxWidth="xs"
      fullWidth={true}
      title="Tool Settings"
    >
      <DialogContent sx={{ padding: 0 }}>
        <Stack spacing={2} padding={2}>
          {localSettings.map((setting) => {
            switch (setting.control) {
              case "percentage":
                return renderPercentage(setting);
              case "switch":
                return null;
              case "text":
                return null;
              default:
                return null;
            }
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit}>Save</Button>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </DefaultDialog>
  );
};

export default ToolSettingsDialog;
