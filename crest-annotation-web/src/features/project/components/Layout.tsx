import React, { PropsWithChildren, ReactNode } from "react";
import { Button, Divider, Stack } from "@mui/material";

interface IProps {
  customActions?: ReactNode;
  // default actions
  onCancel?: () => void;
  onProceed?: () => void;
}

const PageLayout = ({
  customActions,
  onCancel,
  onProceed,
  children,
}: PropsWithChildren<IProps>) => {
  return (
    <>
      {children}
      <Divider />

      <Stack direction="row" spacing={1} padding={2} justifyContent="flex-end">
        {onCancel && (
          <Button onClick={onCancel} variant="outlined">
            Cancel
          </Button>
        )}
        {customActions}
        {onProceed && (
          <Button onClick={onProceed} variant="contained">
            Proceed
          </Button>
        )}
      </Stack>
    </>
  );
};

export default PageLayout;
