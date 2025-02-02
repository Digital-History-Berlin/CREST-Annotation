import { Error } from "@mui/icons-material";
import { Button, Stack, Typography, useTheme } from "@mui/material";
import { useLockObjectMutation } from "../../../../api/openApi";
import {
  useAnnotationObject,
  useAnnotationSession,
} from "../../slice/annotations";

const ToolbarUnlock = () => {
  const theme = useTheme();
  const object = useAnnotationObject();
  const session = useAnnotationSession();

  const [lockRequest] = useLockObjectMutation();

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{
        backgroundColor: theme.palette.warning.main,
        borderRadius: theme.shape.borderRadius,
        color: theme.palette.warning.contrastText,
      }}
    >
      <Error sx={{ mx: 1 }} />
      <Typography>This object is being edited</Typography>
      <Button
        onClick={() =>
          lockRequest({
            objectId: object.id,
            sessionId: session,
            force: true,
          })
        }
        sx={{
          color: theme.palette.warning.contrastText,
          borderRadius: theme.shape.borderRadius,
        }}
      >
        Unlock
      </Button>
    </Stack>
  );
};

export default ToolbarUnlock;
