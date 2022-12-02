import React, { ReactNode } from "react";
import { Stack, Box, useTheme, Typography } from "@mui/material";

interface IProps {
  title?: string;
  children?: ReactNode;
}

const defaultProps = {};

/**
 * Provides the container for components in one of the sidebars
 *
 * Renders a header and scrollable content.
 * All containers will equally share the available height.
 */
const SidebarContainer = ({ title, children }: IProps) => {
  const theme = useTheme();

  return (
    <Stack sx={{ overflow: "hidden", flex: "1" }}>
      <Typography
        sx={{
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.secondary.contrastText,
          padding: theme.spacing(1),
        }}
        variant="h6"
      >
        {title}
      </Typography>
      <Box sx={{ overflow: "auto", flexGrow: "1" }}>{children}</Box>
    </Stack>
  );
};

SidebarContainer.defaultProps = defaultProps;

export default SidebarContainer;
