import React from "react";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import DefaultDialog from "../../../../components/dialogs/DefaultDialog";

interface IProps {
  open: boolean;
  disabled?: boolean;
  onClose: () => void;
  onConfirm: (action: string) => void;
}

const MergeLabelsDialog = ({ open, disabled, onClose, onConfirm }: IProps) => {
  return (
    <DefaultDialog
      open={open}
      onClose={onClose}
      title="Project contains labels"
    >
      <DialogContent>
        <DialogContentText>
          This project already contains labels. It is currently not possible to
          merge existing labels during an import. Please remove all labels
          manually before proceeding.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={disabled}>
          Cancel
        </Button>
        <Box flexGrow={1} />
        <Button
          onClick={() => onConfirm("overwrite")}
          disabled={disabled}
          variant="outlined"
          color="error"
        >
          Overwrite
        </Button>
        <Button disabled={true} variant="outlined">
          Merge
        </Button>
      </DialogActions>
    </DefaultDialog>
  );
};

export default MergeLabelsDialog;
