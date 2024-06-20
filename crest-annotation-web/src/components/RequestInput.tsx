export const unused = undefined;
/*
import React, { ReactNode, useEffect, useState } from "react";
import { Cancel, Check, CheckCircle } from "@mui/icons-material";
import { IconButton, Stack, Typography } from "@mui/material";

interface RequestInputRenderProps<T> {
  value: T;
  onChange: (value: T) => void;
}

interface IProps<T> {
  value: T;
  success: ReactNode;
  error: ReactNode;
  onRequest: () => void;
  renderInput: (props: RequestInputRenderProps<T>) => ReactNode;
}

export function RequestInput<T>({
  value,
  success,
  error,
  onRequest,
  renderInput,
}: IProps<T>) {
  const [dirtyValue, setDirtyValue] = useState<T>();

  // udpate value on external change
  useEffect(() => setDirtyValue(value), [value]);

  return (
    <Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        {renderInput({ value: dirtyValue, onChange: setDirtyValue })}
        <IconButton onClick={onRequest}>
          <Check />
        </IconButton>
      </Stack>
      {success && (
        <Stack direction="row" alignItems="center" gap={1}>
          <CheckCircle color="success" />
          <Typography color="success">{success}</Typography>
        </Stack>
      )}
      {error && (
        <Stack direction="row" alignItems="center" gap={1}>
          <Cancel color="error" />
          <Typography color="error">{error}</Typography>
        </Stack>
      )}
    </Stack>
  );
}
*/
