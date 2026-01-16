import { PropsWithChildren } from "react";
import {
  Box,
  LinearProgress,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useAppSelector } from "../../../../app/hooks";

export const StatusbarProgress = ({ children }: PropsWithChildren) => {
  const theme = useTheme();

  const operationProgress = useAppSelector(
    (state) => state.operation.current?.progress
  );

  const operationName = useAppSelector(
    (state) => state.operation.current?.name
  );

  return (
    <div
      style={{
        background: theme.palette.grey[100],
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack direction="row" alignItems="center" padding={1} spacing={2}>
        {operationProgress || operationName ? (
          <>
            <LinearProgress sx={{ width: 40 }} value={operationProgress} />
            <Typography variant="body2" color="text.secondary">
              {operationName}
            </Typography>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Ready
          </Typography>
        )}
        <Box flexGrow={1} />
        {children}
      </Stack>
    </div>
  );
};
