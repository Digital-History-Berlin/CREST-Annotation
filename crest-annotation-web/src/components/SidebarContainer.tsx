import React, { ReactNode } from "react";
import { Stack, Box, useTheme, Typography, styled } from "@mui/material";

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
  const TitleBox = styled(Box)(({ theme }) => ({
    "&": {
      padding: theme.spacing(1),
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.secondary.main,
      font: theme.typography.h6,
    },
  }));

  return (
    // stretch stack to available size
    // share equally between multiple stacks
    <Stack flex="1 1 0" sx={{ overflow: "hidden" }}>
      <TitleBox>{title}</TitleBox>
      {/* make sure content always stretches over full height */}
      <Box flex="1" sx={{ overflow: "auto" }}>
        {children}
      </Box>
    </Stack>
  );
};

SidebarContainer.defaultProps = defaultProps;

export default SidebarContainer;
