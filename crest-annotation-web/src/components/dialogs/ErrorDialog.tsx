import React from "react";
import { Alert, DialogContent } from "@mui/material";
import DefaultDialog from "./DefaultDialog";

interface IProps {
  error?: string;
  onClose: () => void;
}

const ErrorDialog = ({ error, onClose }: IProps) => {
  return (
    <DefaultDialog
      onClose={onClose}
      open={!!error}
      maxWidth="md"
      fullWidth={true}
      title="Error details"
    >
      <DialogContent>
        <Alert severity="error">{error}</Alert>
      </DialogContent>
    </DefaultDialog>
  );
};

export default ErrorDialog;
