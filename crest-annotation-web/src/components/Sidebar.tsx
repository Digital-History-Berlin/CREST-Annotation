import { PropsWithChildren } from "react";
import { Stack, useTheme } from "@mui/material";

interface IProps {
  position: "left" | "right";
}

const Sidebar = ({ position, children }: PropsWithChildren<IProps>) => {
  const theme = useTheme();

  return (
    <Stack
      sx={{
        width: "440px",
        // show divider on correct side
        borderLeft:
          position === "right"
            ? `1px solid ${theme.palette.divider}`
            : undefined,
        borderRight:
          position === "left"
            ? `1px solid ${theme.palette.divider}`
            : undefined,
      }}
    >
      {children}
    </Stack>
  );
};

export default Sidebar;
